from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db import models, transaction
from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, Cart, CartItem, ProductSize, Wishlist, PromoCode, Review, NewsletterSubscriber
from .serializers import (
    CategorySerializer, ProductSerializer,
    OrderSerializer, CartItemSerializer, ReviewSerializer, NewsletterSubscriberSerializer
)
from rest_framework.views import APIView


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

from rest_framework.filters import OrderingFilter, SearchFilter

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Product.objects.all() # Fallback for DRF basename detection
    serializer_class   = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class   = StandardResultsSetPagination
    filter_backends    = [OrderingFilter]
    ordering_fields    = ['price', 'rating', 'created_at']
    ordering           = ['-created_at']

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        queryset = Product.objects.all().select_related('category').prefetch_related('sizes', 'colors', 'reviews').order_by('-created_at')
        category    = self.request.query_params.get('category')
        search      = self.request.query_params.get('search')
        filter_type = self.request.query_params.get('filter')

        if category and category != 'All':
            queryset = queryset.filter(category__name__iexact=category)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(brand__icontains=search)
            )
        if filter_type == 'new':
            queryset = queryset.filter(is_new=True)
        elif filter_type == 'sale':
            queryset = queryset.filter(discount__isnull=False)

        return queryset


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart  = self._get_cart(request.user)
        items = cart.items.select_related('product').all()
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        cart       = self._get_cart(request.user)
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))
        size       = request.data.get('size', '')
        color      = request.data.get('color', '')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Already exists → quantity update
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, size=size, color=color,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        serializer = CartItemSerializer(item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        cart = self._get_cart(request.user)
        try:
            item = CartItem.objects.get(id=pk, cart=cart)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        cart = self._get_cart(request.user)
        try:
            item     = CartItem.objects.get(id=pk, cart=cart)
            quantity = int(request.data.get('quantity', item.quantity))
            if quantity <= 0:
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            item.quantity = quantity
            item.save()
            serializer = CartItemSerializer(item, context={'request': request})
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self._get_cart(request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart_items   = request.data.get('items', [])
        total_amount = request.data.get('total_amount', 0)

        serializer = self.get_serializer(data={"total_amount": total_amount})
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=request.user)

        for item_data in cart_items:
            try:
                product_id = int(item_data.get('product_id'))
                quantity   = int(item_data.get('quantity', 1))
                size       = item_data.get('size')
                color      = item_data.get('color')
                price      = float(item_data.get('price', 0))
                product    = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {product_id} not found")

            product_size = ProductSize.objects.filter(product=product, size=size).first()
            if product_size and product_size.stock < quantity:
                raise serializers.ValidationError(f"Insufficient stock for {product.name}")
            if product_size:
                product_size.stock -= quantity
                product_size.save()

            OrderItem.objects.create(
                order=order, product=product,
                quantity=quantity, size=size, color=color, price=price
            )

        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
        except Cart.DoesNotExist:
            pass

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    

class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        return wishlist

    def get(self, request):
        wishlist   = self._get_wishlist(request.user)
        products   = wishlist.products.all()
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response([{"product": p} for p in serializer.data])

    def delete(self, request):
        wishlist = self._get_wishlist(request.user)
        wishlist.products.clear()
        return Response(status=204)


class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        try:
            product     = Product.objects.get(id=product_id)
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            if product in wishlist.products.all():
                wishlist.products.remove(product)
                return Response({"action": "removed"})
            else:
                wishlist.products.add(product)
                return Response({"action": "added"})
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=404)
        
class PromoCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get("code", "").strip().upper()
        try:
            promo = PromoCode.objects.get(code=code, is_active=True)
            return Response({
                "valid": True,
                "code": promo.code,
                "discount_percent": promo.discount_percent,
                "message": f"{promo.discount_percent}% discount applied!"
            })
        except PromoCode.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid or expired promo code."
            }, status=400)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class   = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.kwargs.get('product_pk')
        return Review.objects.filter(product_id=product_id).order_by('-created_at')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk')
        product    = Product.objects.get(id=product_id)

        if Review.objects.filter(product=product, user=self.request.user).exists():
            raise ValidationError("You have already reviewed this product.")

        delivered = OrderItem.objects.filter(
            order__user=self.request.user,
            order__status='Delivered',
            product=product
        ).exists()

        if not delivered:
            raise ValidationError("You can only review this product after it has been delivered.")

        review = serializer.save(user=self.request.user, product=product)

        review_count = product.review_count or 0
        total_rating = float(product.rating or 0) * review_count + review.rating
        product.review_count = review_count + 1
        product.rating = round(total_rating / product.review_count, 1)
        product.save(update_fields=['rating', 'review_count'])

class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = NewsletterSubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Successfully subscribed to newsletter!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
