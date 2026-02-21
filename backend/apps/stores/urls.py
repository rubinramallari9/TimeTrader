from django.urls import path
from . import views

urlpatterns = [
    path("", views.stores, name="stores"),
    path("<slug:slug>/", views.store_detail, name="store-detail"),
    path("<slug:slug>/logo/", views.upload_store_logo, name="store-logo"),
    path("<slug:slug>/reviews/", views.store_reviews, name="store-reviews"),
]
