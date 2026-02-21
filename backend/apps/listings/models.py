import uuid
from django.db import models
from django.conf import settings


class Listing(models.Model):
    class Condition(models.TextChoices):
        NEW = "new", "New"
        EXCELLENT = "excellent", "Excellent"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    class MovementType(models.TextChoices):
        AUTOMATIC = "automatic", "Automatic"
        MANUAL = "manual", "Manual"
        QUARTZ = "quartz", "Quartz"
        SOLAR = "solar", "Solar"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        PENDING = "pending", "Pending"
        REMOVED = "removed", "Removed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings"
    )
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    reference_number = models.CharField(max_length=100, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    condition = models.CharField(max_length=20, choices=Condition.choices)
    movement_type = models.CharField(max_length=20, choices=MovementType.choices, blank=True)
    case_material = models.CharField(max_length=100, blank=True)
    case_diameter_mm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    is_authenticated = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    location_city = models.CharField(max_length=100, blank=True)
    location_country = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "listings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["brand"]),
            models.Index(fields=["status"]),
            models.Index(fields=["price"]),
            models.Index(fields=["condition"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.brand} {self.model} — {self.seller}"

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()


class ListingImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="listings/%Y/%m/")
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "listing_images"
        ordering = ["order", "created_at"]

    def save(self, *args, **kwargs):
        # Ensure only one primary image per listing
        if self.is_primary:
            ListingImage.objects.filter(listing=self.listing, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class SavedListing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_listings"
    )
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "saved_listings"
        unique_together = ("user", "listing")
