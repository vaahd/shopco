from rest_framework import serializers
from authentication.models import User
from .models import Category, Product, ProductSize, ProductColor, Order, OrderItem, Cart, CartItem,Review, NewsletterSubscriber

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'size', 'stock']


class ProductColorSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductColor
        fields = ['name', 'hex_code', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class ReviewSerializer(serializers.ModelSerializer):
    user_name  = serializers.CharField(source='user.name', read_only=True)
    created_at = serializers.DateTimeField(format="%B %d, %Y", read_only=True)

    class Meta:
        model  = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

        
class ProductSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    sizes    = ProductSizeSerializer(many=True, read_only=True)
    colors   = ProductColorSerializer(many=True, read_only=True)
    image    = serializers.SerializerMethodField()
    reviews  = ReviewSerializer(many=True, read_only=True)  

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'brand', 'price', 'original_price', 'rating',
            'review_count', 'image', 'category', 'description',
            'is_new', 'discount', 'sizes', 'colors','reviews' 
        ]

    def get_image(self, obj):
        if obj.image:
            return f"http://127.0.0.1:8000/media/{obj.image.name.split('media/')[-1]}"
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product    = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'size', 'color']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField() 

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'size', 'color', 'price']

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            return f"http://127.0.0.1:8000/media/{obj.product.image.name.split('media/')[-1]}"
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True) 

    class Meta:
        model        = Order
        fields       = ['id', 'user', 'total_amount', 'status', 'created_at', 'items']
        read_only_fields = ['id', 'created_at', 'user']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'email', 'name']

class ReviewSerializer(serializers.ModelSerializer):
    user_name  = serializers.CharField(source='user.name', read_only=True)
    created_at = serializers.DateTimeField(format="%B %d, %Y", read_only=True)

    class Meta:
        model  = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model  = NewsletterSubscriber
        fields = ['id', 'email', 'subscribed_at']
        read_only_fields = ['id', 'subscribed_at']
