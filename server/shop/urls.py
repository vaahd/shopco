from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import CategoryViewSet, ProductViewSet, OrderViewSet,CartViewSet ,WishlistView, WishlistToggleView,PromoCodeView,ReviewViewSet, NewsletterSubscribeView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'cart', CartViewSet, basename='cart')

# Nested router — /api/products/{product_pk}/reviews/
products_router = routers.NestedDefaultRouter(router, r'products', lookup='product')
products_router.register(r'reviews', ReviewViewSet, basename='product-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(products_router.urls)),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("wishlist/toggle/", WishlistToggleView.as_view(), name="wishlist-toggle"),
    path("wishlist/clear/", WishlistView.as_view(), name="wishlist-clear"),
    path("promo/validate/", PromoCodeView.as_view(), name="promo-validate"),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
]
