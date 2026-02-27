import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify


STORE_PROMOTION_PLANS = {
    "spotlight": {"label": "Spotlight", "days": 30,  "price": "19.99"},
    "featured":  {"label": "Featured",  "days": 90,  "price": "49.99"},
}


class Store(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="store"
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="stores/logos/", null=True, blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stores"
        ordering = ["-is_featured", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            i = 1
            while Store.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        agg = self.reviews.aggregate(models.Avg("rating"))
        return round(agg["rating__avg"] or 0, 1)

    @property
    def review_count(self):
        return self.reviews.count()


class StoreImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="stores/images/")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "store_images"
        ordering = ["order"]


class StorePromotion(models.Model):
    class Plan(models.TextChoices):
        SPOTLIGHT = "spotlight", "Spotlight"
        FEATURED  = "featured",  "Featured"

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store      = models.OneToOneField(Store, on_delete=models.CASCADE, related_name="promotion")
    plan       = models.CharField(max_length=20, choices=Plan.choices)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active  = models.BooleanField(default=True)

    class Meta:
        db_table = "store_promotions"

    def __str__(self):
        return f"{self.store} — {self.plan}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="store_reviews"
    )
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField()  # 1–5
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "store_reviews"
        unique_together = ("author", "store")
        ordering = ["-created_at"]

    def clean(self):
        from django.core.exceptions import ValidationError
        if not 1 <= self.rating <= 5:
            raise ValidationError("Rating must be between 1 and 5.")
