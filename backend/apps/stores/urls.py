from django.urls import path
from . import views

urlpatterns = [
    path("", views.stores, name="stores"),
    path("mine/", views.my_store, name="my-store"),
    path("<slug:slug>/", views.store_detail, name="store-detail"),
    path("<slug:slug>/logo/", views.upload_store_logo, name="store-logo"),
    path("<slug:slug>/listings/", views.store_listings, name="store-listings"),
    path("<slug:slug>/promote/", views.store_promote, name="store-promote"),
    path("<slug:slug>/reviews/", views.store_reviews, name="store-reviews"),
]
