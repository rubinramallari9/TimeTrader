from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

from django.utils import timezone
from datetime import timedelta

from .models import Store, StoreImage, StorePromotion, Review, STORE_PROMOTION_PLANS
from .serializers import (
    StoreCardSerializer, StoreDetailSerializer, StorePromotionSerializer,
    CreateUpdateStoreSerializer, ReviewSerializer, CreateReviewSerializer,
)
from apps.users.models import User
from apps.users.permissions import IsOwnerOrAdmin
from apps.listings.models import Listing
from apps.listings.serializers import MyListingSerializer


class StorePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def stores(request):
    if request.method == "GET":
        qs = Store.objects.all()
        search = request.GET.get("search", "")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(city__icontains=search) | Q(country__icontains=search))
        city = request.GET.get("city")
        if city:
            qs = qs.filter(city__icontains=city)
        country = request.GET.get("country")
        if country:
            qs = qs.filter(country__icontains=country)
        if request.GET.get("featured"):
            qs = qs.filter(is_featured=True)
        paginator = StorePagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(
            StoreCardSerializer(page, many=True, context={"request": request}).data
        )

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role != User.Role.STORE and not request.user.is_staff:
        return Response({"error": "Only store owners can create a store profile."}, status=status.HTTP_403_FORBIDDEN)
    if hasattr(request.user, "store"):
        return Response({"error": "You already have a store profile."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateUpdateStoreSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    store = serializer.save(owner=request.user)
    return Response(StoreDetailSerializer(store, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def store_detail(request, slug):
    try:
        store = Store.objects.prefetch_related("images", "reviews__author").get(slug=slug)
    except Store.DoesNotExist:
        return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(StoreDetailSerializer(store, context={"request": request}).data)

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    store.user = store.owner
    if not IsOwnerOrAdmin().has_object_permission(request, None, store):
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PATCH":
        serializer = CreateUpdateStoreSerializer(store, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StoreDetailSerializer(store, context={"request": request}).data)

    store.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_store_logo(request, slug):
    try:
        store = Store.objects.get(slug=slug, owner=request.user)
    except Store.DoesNotExist:
        return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
    logo = request.FILES.get("logo")
    if not logo:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
    store.logo = logo
    store.save(update_fields=["logo"])
    return Response(StoreDetailSerializer(store, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_store(request):
    try:
        store = Store.objects.get(owner=request.user)
    except Store.DoesNotExist:
        return Response({"error": "No store profile found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(StoreDetailSerializer(store, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def store_listings(request, slug):
    try:
        store = Store.objects.get(slug=slug)
    except Store.DoesNotExist:
        return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

    qs = Listing.objects.filter(
        seller=store.owner,
        status=Listing.Status.ACTIVE,
    ).prefetch_related("images").order_by("-created_at")

    paginator = StorePagination()
    page = paginator.paginate_queryset(qs, request)
    from apps.listings.serializers import ListingCardSerializer
    serializer = ListingCardSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def store_promote(request, slug):
    try:
        store = Store.objects.get(slug=slug, owner=request.user)
    except Store.DoesNotExist:
        return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        try:
            promo = store.promotion
            return Response(StorePromotionSerializer(promo).data)
        except StorePromotion.DoesNotExist:
            return Response(None)

    plan = request.data.get("plan")
    if plan not in STORE_PROMOTION_PLANS:
        return Response({"error": "Invalid plan."}, status=status.HTTP_400_BAD_REQUEST)

    days = STORE_PROMOTION_PLANS[plan]["days"]
    expires = timezone.now() + timedelta(days=days)

    promo, _ = StorePromotion.objects.update_or_create(
        store=store,
        defaults={"plan": plan, "expires_at": expires, "is_active": True},
    )
    store.is_featured = True
    store.save(update_fields=["is_featured"])

    return Response(StorePromotionSerializer(promo).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def store_reviews(request, slug):
    try:
        store = Store.objects.get(slug=slug)
    except Store.DoesNotExist:
        return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        reviews = store.reviews.select_related("author").all()
        paginator = StorePagination()
        page = paginator.paginate_queryset(reviews, request)
        return paginator.get_paginated_response(
            ReviewSerializer(page, many=True, context={"request": request}).data
        )

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if store.reviews.filter(author=request.user).exists():
        return Response({"error": "You already reviewed this store."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review = serializer.save(author=request.user, store=store)
    return Response(ReviewSerializer(review, context={"request": request}).data, status=status.HTTP_201_CREATED)
