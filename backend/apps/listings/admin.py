from django.contrib import admin
from .models import Listing, ListingImage, SavedListing, ListingPromotion


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0
    readonly_fields = ("id",)


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "brand", "model", "seller", "price", "condition", "status", "created_at")
    list_filter = ("status", "condition", "movement_type")
    search_fields = ("title", "brand", "model", "seller__email")
    ordering = ("-created_at",)
    readonly_fields = ("id", "views_count", "created_at", "updated_at")
    inlines = [ListingImageInline]


@admin.register(SavedListing)
class SavedListingAdmin(admin.ModelAdmin):
    list_display = ("user", "listing", "created_at")
    readonly_fields = ("id", "created_at")


@admin.register(ListingPromotion)
class ListingPromotionAdmin(admin.ModelAdmin):
    list_display = ("listing", "plan", "started_at", "expires_at", "is_active", "is_expired")
    list_filter = ("plan", "is_active")
    search_fields = ("listing__title", "listing__seller__email")
    readonly_fields = ("id", "started_at", "is_expired")
