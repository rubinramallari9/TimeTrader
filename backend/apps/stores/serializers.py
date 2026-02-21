from rest_framework import serializers
from .models import Store, StoreImage, Review
from apps.users.serializers import UserPublicSerializer


class StoreImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = StoreImage
        fields = ("id", "url", "order")

    def get_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class ReviewSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "author", "rating", "content", "created_at")
        read_only_fields = ("id", "author", "created_at")


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("rating", "content")

    def validate_rating(self, v):
        if not 1 <= v <= 5:
            raise serializers.ValidationError("Rating must be 1–5.")
        return v


class StoreCardSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = (
            "id", "name", "slug", "logo_url", "city", "country",
            "is_featured", "is_verified", "average_rating", "review_count",
        )

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url


class StoreDetailSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    images = StoreImageSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = (
            "id", "name", "slug", "description", "logo_url", "website",
            "phone", "email", "address", "city", "country",
            "latitude", "longitude", "opening_hours",
            "is_featured", "is_verified",
            "owner", "images", "average_rating", "review_count",
            "created_at", "updated_at",
        )

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url


class CreateUpdateStoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = (
            "name", "description", "website", "phone", "email",
            "address", "city", "country", "latitude", "longitude", "opening_hours",
        )
