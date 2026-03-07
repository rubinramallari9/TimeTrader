from django.contrib import admin
from .models import Store, StoreImage, Review, StorePromotion


class StoreImageInline(admin.TabularInline):
    model = StoreImage
    extra = 0


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "city", "country", "is_featured", "is_verified", "created_at")
    list_filter = ("is_featured", "is_verified")
    search_fields = ("name", "city", "owner__email")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [StoreImageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("store", "author", "rating", "created_at")
    list_filter = ("rating",)


@admin.register(StorePromotion)
class StorePromotionAdmin(admin.ModelAdmin):
    list_display = ("store", "plan", "started_at", "expires_at", "is_active", "is_expired")
    list_filter = ("plan", "is_active")
    search_fields = ("store__name", "store__owner__email")
    readonly_fields = ("id", "started_at", "is_expired")
