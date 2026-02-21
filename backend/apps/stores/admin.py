from django.contrib import admin
from .models import Store, StoreImage, Review


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
