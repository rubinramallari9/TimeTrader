from django.contrib import admin
from .models import RepairShop, RepairService, Appointment, RepairReview


class RepairServiceInline(admin.TabularInline):
    model = RepairService
    extra = 0


@admin.register(RepairShop)
class RepairShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "city", "country", "is_featured", "is_verified", "created_at")
    list_filter = ("is_featured", "is_verified")
    search_fields = ("name", "city", "owner__email")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [RepairServiceInline]


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("shop", "customer", "service", "scheduled_at", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("shop__name", "customer__email")


@admin.register(RepairReview)
class RepairReviewAdmin(admin.ModelAdmin):
    list_display = ("shop", "author", "rating", "created_at")
    list_filter = ("rating",)
