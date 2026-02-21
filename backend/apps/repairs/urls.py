from django.urls import path
from . import views

urlpatterns = [
    path("", views.repair_shops, name="repair-shops"),
    path("<slug:slug>/", views.repair_shop_detail, name="repair-shop-detail"),
    path("<slug:slug>/services/", views.repair_services, name="repair-services"),
    path("<slug:slug>/services/<uuid:service_id>/", views.repair_service_detail, name="repair-service-detail"),
    path("<slug:slug>/appointments/", views.appointments, name="repair-appointments"),
    path("<slug:slug>/appointments/<uuid:appt_id>/", views.appointment_detail, name="repair-appointment-detail"),
    path("<slug:slug>/reviews/", views.repair_reviews, name="repair-reviews"),
]
