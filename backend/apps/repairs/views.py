from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

from .models import RepairShop, RepairService, Appointment, RepairReview, RepairShowcase
from .serializers import (
    RepairShopCardSerializer, RepairShopDetailSerializer,
    CreateUpdateRepairShopSerializer, RepairServiceSerializer,
    AppointmentSerializer, CreateAppointmentSerializer,
    RepairReviewSerializer, CreateRepairReviewSerializer,
    RepairShowcaseSerializer, RepairShowcaseWriteSerializer,
)
from apps.users.models import User
from apps.users.permissions import IsOwnerOrAdmin


class RepairPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def repair_shops(request):
    if request.method == "GET":
        qs = RepairShop.objects.all()
        search = request.GET.get("search", "")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(city__icontains=search) | Q(country__icontains=search))
        if request.GET.get("city"):
            qs = qs.filter(city__icontains=request.GET["city"])
        if request.GET.get("country"):
            qs = qs.filter(country__icontains=request.GET["country"])
        if request.GET.get("featured"):
            qs = qs.filter(is_featured=True)
        paginator = RepairPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(
            RepairShopCardSerializer(page, many=True, context={"request": request}).data
        )

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role != User.Role.REPAIR and not request.user.is_staff:
        return Response({"error": "Only repair shops can create a profile."}, status=status.HTTP_403_FORBIDDEN)
    if hasattr(request.user, "repair_shop"):
        return Response({"error": "You already have a repair shop profile."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateUpdateRepairShopSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    shop = serializer.save(owner=request.user)
    return Response(RepairShopDetailSerializer(shop, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def repair_shop_detail(request, slug):
    try:
        shop = RepairShop.objects.prefetch_related("services", "reviews__author").get(slug=slug)
    except RepairShop.DoesNotExist:
        return Response({"error": "Repair shop not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(RepairShopDetailSerializer(shop, context={"request": request}).data)

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    shop.user = shop.owner
    if not IsOwnerOrAdmin().has_object_permission(request, None, shop):
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PATCH":
        serializer = CreateUpdateRepairShopSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(RepairShopDetailSerializer(shop, context={"request": request}).data)

    shop.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def repair_services(request, slug):
    try:
        shop = RepairShop.objects.get(slug=slug)
    except RepairShop.DoesNotExist:
        return Response({"error": "Repair shop not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(RepairServiceSerializer(shop.services.all(), many=True).data)

    if not request.user.is_authenticated or shop.owner != request.user:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = RepairServiceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = serializer.save(shop=shop)
    return Response(RepairServiceSerializer(service).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def repair_service_detail(request, slug, service_id):
    try:
        shop = RepairShop.objects.get(slug=slug, owner=request.user)
        service = shop.services.get(id=service_id)
    except (RepairShop.DoesNotExist, RepairService.DoesNotExist):
        return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        serializer = RepairServiceSerializer(service, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(RepairServiceSerializer(service).data)

    service.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
def appointments(request, slug):
    try:
        shop = RepairShop.objects.get(slug=slug)
    except RepairShop.DoesNotExist:
        return Response({"error": "Repair shop not found."}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        # Shop owner sees all; customer sees their own
        if shop.owner == request.user or request.user.is_staff:
            qs = shop.appointments.select_related("customer", "service").all()
        else:
            qs = shop.appointments.filter(customer=request.user).select_related("service")
        paginator = RepairPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(AppointmentSerializer(page, many=True).data)

    # POST — book appointment
    serializer = CreateAppointmentSerializer(data=request.data, context={"shop_slug": slug})
    serializer.is_valid(raise_exception=True)
    appt = serializer.save(shop=shop, customer=request.user)
    return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def appointment_detail(request, slug, appt_id):
    try:
        shop = RepairShop.objects.get(slug=slug, owner=request.user)
        appt = shop.appointments.get(id=appt_id)
    except (RepairShop.DoesNotExist, Appointment.DoesNotExist):
        return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status not in [c[0] for c in Appointment.Status.choices]:
        return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
    appt.status = new_status
    appt.save(update_fields=["status"])
    return Response(AppointmentSerializer(appt).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_repair_shop(request):
    try:
        shop = RepairShop.objects.prefetch_related("services").get(owner=request.user)
    except RepairShop.DoesNotExist:
        return Response({"error": "No repair shop found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(RepairShopDetailSerializer(shop, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_repair_logo(request):
    try:
        shop = RepairShop.objects.get(owner=request.user)
    except RepairShop.DoesNotExist:
        return Response({"error": "No repair shop found."}, status=status.HTTP_404_NOT_FOUND)
    logo = request.FILES.get("logo")
    if not logo:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
    shop.logo = logo
    shop.save(update_fields=["logo"])
    return Response(RepairShopDetailSerializer(shop, context={"request": request}).data)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def repair_showcase(request, slug):
    try:
        shop = RepairShop.objects.get(slug=slug)
    except RepairShop.DoesNotExist:
        return Response({"error": "Repair shop not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        items = shop.showcase_items.all()
        return Response(RepairShowcaseSerializer(items, many=True, context={"request": request}).data)

    if not request.user.is_authenticated or shop.owner != request.user:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = RepairShowcaseWriteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    item = serializer.save(shop=shop)
    return Response(RepairShowcaseSerializer(item, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def repair_showcase_detail(request, slug, item_id):
    try:
        shop = RepairShop.objects.get(slug=slug, owner=request.user)
        item = shop.showcase_items.get(id=item_id)
    except (RepairShop.DoesNotExist, RepairShowcase.DoesNotExist):
        return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def repair_reviews(request, slug):
    try:
        shop = RepairShop.objects.get(slug=slug)
    except RepairShop.DoesNotExist:
        return Response({"error": "Repair shop not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        reviews = shop.reviews.select_related("author").all()
        paginator = RepairPagination()
        page = paginator.paginate_queryset(reviews, request)
        return paginator.get_paginated_response(RepairReviewSerializer(page, many=True).data)

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if shop.reviews.filter(author=request.user).exists():
        return Response({"error": "You already reviewed this shop."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateRepairReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review = serializer.save(author=request.user, shop=shop)
    return Response(RepairReviewSerializer(review).data, status=status.HTTP_201_CREATED)
