from django.contrib import admin
from .models import Category, Product, ProductSize, ProductColor, Order, OrderItem, Cart, CartItem,PromoCode,Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1


class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ("name", "brand", "price", "category", "is_new", "rating")
    list_filter   = ("category", "is_new")
    search_fields = ("name", "brand")
    inlines       = [ProductSizeInline, ProductColorInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "size", "color", "price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ("id", "user", "total_amount", "status", "created_at")
    list_filter    = ("status",)
    search_fields  = ("user__email",)
    readonly_fields = ("user", "total_amount", "created_at")
    inlines        = [OrderItemInline]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user",)
    inlines      = [CartItemInline]

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display  = ("code", "discount_percent", "is_active", "created_at")
    list_filter   = ("is_active",)
    search_fields = ("code",)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ("user", "product", "rating", "created_at")
    list_filter   = ("rating",)
    search_fields = ("user__email", "product__name")

