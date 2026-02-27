from django.urls import path
from ..views.users import (
    me,
    upload_avatar,
    change_password,
    public_profile,
    seller_listings,
)

urlpatterns = [
    path("me/", me, name="user-me"),
    path("me/avatar/", upload_avatar, name="user-avatar"),
    path("me/password/", change_password, name="user-change-password"),
    path("<uuid:user_id>/", public_profile, name="user-public-profile"),
    path("<uuid:user_id>/listings/", seller_listings, name="user-seller-listings"),
]
