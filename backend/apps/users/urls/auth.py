from django.urls import path
from ..views.auth import (
    register,
    login,
    logout,
    token_refresh,
    verify_email,
    password_reset_request,
    password_reset_confirm,
    google_oauth,
)

urlpatterns = [
    path("register/", register, name="auth-register"),
    path("login/", login, name="auth-login"),
    path("logout/", logout, name="auth-logout"),
    path("token/refresh/", token_refresh, name="auth-token-refresh"),
    path("verify-email/<uuid:token>/", verify_email, name="auth-verify-email"),
    path("password/reset/", password_reset_request, name="auth-password-reset"),
    path("password/confirm/", password_reset_confirm, name="auth-password-confirm"),
    path("oauth/google/", google_oauth, name="auth-google-oauth"),
]
