from rest_framework import serializers
from .models import RepairShop, RepairService, Appointment, RepairReview, RepairShowcase
from apps.users.serializers import UserPublicSerializer


class RepairServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairService
        fields = ("id", "name", "description", "price_from", "price_to", "duration_days", "created_at")
        read_only_fields = ("id", "created_at")


class RepairReviewSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = RepairReview
        fields = ("id", "author", "rating", "content", "created_at")
        read_only_fields = ("id", "author", "created_at")


class CreateRepairReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairReview
        fields = ("rating", "content")

    def validate_rating(self, v):
        if not 1 <= v <= 5:
            raise serializers.ValidationError("Rating must be 1–5.")
        return v


class RepairShopCardSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    service_count = serializers.SerializerMethodField()

    class Meta:
        model = RepairShop
        fields = (
            "id", "name", "slug", "logo_url", "city", "country",
            "is_featured", "is_verified", "average_rating", "review_count", "service_count",
        )

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url

    def get_service_count(self, obj):
        return obj.services.count()


class RepairShopDetailSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    services = RepairServiceSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = RepairShop
        fields = (
            "id", "name", "slug", "description", "logo_url",
            "phone", "email", "address", "city", "country",
            "latitude", "longitude", "opening_hours",
            "is_featured", "is_verified",
            "owner", "services", "average_rating", "review_count",
            "created_at", "updated_at",
        )

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url


class CreateUpdateRepairShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairShop
        fields = (
            "name", "description", "phone", "email",
            "address", "city", "country", "latitude", "longitude", "opening_hours",
        )


class RepairShowcaseSerializer(serializers.ModelSerializer):
    before_image_url = serializers.SerializerMethodField()
    after_image_url = serializers.SerializerMethodField()

    class Meta:
        model = RepairShowcase
        fields = (
            "id", "title", "description",
            "before_image_url", "after_image_url",
            "watch_brand", "watch_model", "created_at",
        )
        read_only_fields = ("id", "created_at", "before_image_url", "after_image_url")

    def get_before_image_url(self, obj):
        if not obj.before_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.before_image.url) if request else obj.before_image.url

    def get_after_image_url(self, obj):
        if not obj.after_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.after_image.url) if request else obj.after_image.url


class RepairShowcaseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairShowcase
        fields = ("title", "description", "before_image", "after_image", "watch_brand", "watch_model")


class AppointmentSerializer(serializers.ModelSerializer):
    customer = UserPublicSerializer(read_only=True)
    service = RepairServiceSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ("id", "shop", "service", "customer", "scheduled_at", "status", "notes", "created_at", "updated_at")
        read_only_fields = ("id", "customer", "created_at", "updated_at")


class CreateAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ("service", "scheduled_at", "notes")

    def validate_service(self, service):
        shop_slug = self.context.get("shop_slug")
        if service and service.shop.slug != shop_slug:
            raise serializers.ValidationError("Service does not belong to this shop.")
        return service
