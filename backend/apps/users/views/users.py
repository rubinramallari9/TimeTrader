from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from ..models import User
from ..serializers import (
    UserProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    UserPublicSerializer,
)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        return Response(UserProfileSerializer(request.user, context={"request": request}).data)

    serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserProfileSerializer(request.user, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_avatar(request):
    file = request.FILES.get("avatar")
    if not file:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
    request.user.avatar = file
    request.user.save(update_fields=["avatar"])
    return Response(UserProfileSerializer(request.user, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save(update_fields=["password"])
    return Response({"message": "Password updated."})


@api_view(["GET"])
@permission_classes([AllowAny])
def public_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserPublicSerializer(user).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def seller_listings(request, user_id):
    """Proxy to listings app — returns active listings by this seller."""
    from apps.listings.models import Listing
    from apps.listings.serializers import ListingCardSerializer

    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    listings = Listing.objects.filter(seller=user, status="active").order_by("-created_at")
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(listings, request)
    return paginator.get_paginated_response(ListingCardSerializer(page, many=True).data)
