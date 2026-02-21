from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Listing, ListingImage, SavedListing
from .serializers import (
    ListingCardSerializer,
    ListingDetailSerializer,
    CreateListingSerializer,
    UpdateListingSerializer,
    ListingImageSerializer,
)
from .filters import ListingFilter
from apps.users.permissions import IsSellerOrStoreOrRepair, IsOwnerOrAdmin


class ListingPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


@api_view(["GET", "POST"])
def listings(request):
    if request.method == "GET":
        return _list_listings(request)
    # POST requires auth + seller role
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    perm = IsSellerOrStoreOrRepair()
    if not perm.has_permission(request, None):
        return Response({"error": "Only sellers can create listings."}, status=status.HTTP_403_FORBIDDEN)
    return _create_listing(request)


def _list_listings(request):
    qs = Listing.objects.filter(status=Listing.Status.ACTIVE).select_related("seller").prefetch_related("images", "saved_by")

    # Apply filters
    f = ListingFilter(request.GET, queryset=qs)
    qs = f.qs

    # Search
    search = request.GET.get("search", "").strip()
    if search:
        from django.db.models import Q
        qs = qs.filter(
            Q(title__icontains=search) |
            Q(brand__icontains=search) |
            Q(model__icontains=search) |
            Q(description__icontains=search)
        )

    # Ordering
    sort = request.GET.get("sort", "-created_at")
    allowed_sorts = ["price", "-price", "created_at", "-created_at", "views_count", "-views_count"]
    if sort in allowed_sorts:
        qs = qs.order_by(sort)

    paginator = ListingPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = ListingCardSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


def _create_listing(request):
    serializer = CreateListingSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    listing = serializer.save()
    return Response(
        ListingDetailSerializer(listing, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PATCH", "DELETE"])
def listing_detail(request, listing_id):
    try:
        listing = Listing.objects.select_related("seller").prefetch_related("images", "saved_by").get(id=listing_id)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # Increment view count
        Listing.objects.filter(id=listing_id).update(views_count=listing.views_count + 1)
        serializer = ListingDetailSerializer(listing, context={"request": request})
        return Response(serializer.data)

    # PATCH / DELETE require ownership
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    perm = IsOwnerOrAdmin()
    listing.user = listing.seller  # normalize for permission check
    if not perm.has_object_permission(request, None, listing):
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PATCH":
        serializer = UpdateListingSerializer(listing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ListingDetailSerializer(listing, context={"request": request}).data)

    # DELETE — soft delete
    listing.status = Listing.Status.REMOVED
    listing.save(update_fields=["status"])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_listing_image(request, listing_id):
    try:
        listing = Listing.objects.get(id=listing_id, seller=request.user)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    if listing.images.count() >= 10:
        return Response({"error": "Maximum 10 images per listing."}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES.get("image")
    if not image_file:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    is_primary = listing.images.count() == 0  # first image is primary
    img = ListingImage.objects.create(
        listing=listing,
        image=image_file,
        is_primary=is_primary,
        order=listing.images.count(),
    )
    return Response(ListingImageSerializer(img, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_listing_image(request, listing_id, image_id):
    try:
        img = ListingImage.objects.get(id=image_id, listing__id=listing_id, listing__seller=request.user)
    except ListingImage.DoesNotExist:
        return Response({"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND)
    img.image.delete(save=False)
    img.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def toggle_save(request, listing_id):
    try:
        listing = Listing.objects.get(id=listing_id, status=Listing.Status.ACTIVE)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        SavedListing.objects.get_or_create(user=request.user, listing=listing)
        return Response({"saved": True}, status=status.HTTP_201_CREATED)

    SavedListing.objects.filter(user=request.user, listing=listing).delete()
    return Response({"saved": False})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_listings(request):
    saved = SavedListing.objects.filter(user=request.user).select_related(
        "listing__seller"
    ).prefetch_related("listing__images", "listing__saved_by").order_by("-created_at")

    listings_qs = [s.listing for s in saved]
    paginator = ListingPagination()
    page = paginator.paginate_queryset(listings_qs, request)
    serializer = ListingCardSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)
