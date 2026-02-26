from django.contrib import admin
from .models import Listing, ListingImage, SavedListing


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
