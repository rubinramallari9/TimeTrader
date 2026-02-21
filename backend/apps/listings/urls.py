from django.urls import path
from . import views

urlpatterns = [
    path("", views.listings, name="listings"),
    path("saved/", views.saved_listings, name="listings-saved"),
    path("<uuid:listing_id>/", views.listing_detail, name="listing-detail"),
    path("<uuid:listing_id>/images/", views.upload_listing_image, name="listing-images-upload"),
    path("<uuid:listing_id>/images/<uuid:image_id>/", views.delete_listing_image, name="listing-image-delete"),
    path("<uuid:listing_id>/save/", views.toggle_save, name="listing-save"),
]
