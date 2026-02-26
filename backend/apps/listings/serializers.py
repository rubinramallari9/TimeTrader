from rest_framework import serializers
from .models import Listing, ListingImage, ListingPromotion, SavedListing, PROMOTION_PLANS
from apps.users.serializers import UserPublicSerializer


class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ("id", "url", "is_primary", "order")

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ListingCardSerializer(serializers.ModelSerializer):
    """Compact serializer for listing cards in search results."""
    primary_image = serializers.SerializerMethodField()
    seller = UserPublicSerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = (
            "id", "title", "brand", "model", "condition", "price", "currency",
            "location_city", "location_country",
            "primary_image", "seller", "is_saved", "views_count", "created_at",
        )

    def get_primary_image(self, obj):
        img = obj.primary_image
        if not img:
            return None
        request = self.context.get("request")
        url = request.build_absolute_uri(img.image.url) if request else img.image.url
        return {"id": str(img.id), "url": url, "is_primary": img.is_primary}

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False


class ListingDetailSerializer(serializers.ModelSerializer):
    """Full listing detail including all images and seller."""
    images = ListingImageSerializer(many=True, read_only=True)
    seller = UserPublicSerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = (
            "id", "title", "brand", "model", "reference_number", "year",
            "condition", "movement_type", "case_material", "case_diameter_mm",
            "price", "currency", "description", "status",
            "is_featured", "featured_until",
            "location_city", "location_country", "views_count",
            "images", "seller", "is_saved", "created_at", "updated_at",
        )

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False


class ListingPromotionSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    plan_label = serializers.SerializerMethodField()

    class Meta:
        model = ListingPromotion
        fields = ("id", "plan", "plan_label", "started_at", "expires_at", "is_active", "is_expired")

    def get_plan_label(self, obj):
        return PROMOTION_PLANS.get(obj.plan, {}).get("label", obj.plan)


class CreateListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = (
            "title", "brand", "model", "reference_number", "year",
            "condition", "movement_type", "case_material", "case_diameter_mm",
            "price", "currency", "description", "location_city", "location_country",
        )

    def create(self, validated_data):
        validated_data["seller"] = self.context["request"].user
        return super().create(validated_data)


class UpdateListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = (
            "title", "brand", "model", "reference_number", "year",
            "condition", "movement_type", "case_material", "case_diameter_mm",
            "price", "currency", "description", "location_city", "location_country", "status",
        )

    def validate_status(self, value):
        if value == Listing.Status.REMOVED:
            raise serializers.ValidationError("Use the delete endpoint to remove a listing.")
        return value
