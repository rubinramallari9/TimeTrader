from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from ..models import User, EmailVerificationToken, PasswordResetToken
from ..serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    GoogleOAuthSerializer,
)


def _token_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserProfileSerializer(user).data,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    # Create email verification token
    EmailVerificationToken.objects.create(user=user)
    # TODO: send verification email via Celery task (Stage 8)
    return Response(
        {"message": "Account created. Please verify your email.", "user": UserProfileSerializer(user).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    return Response(_token_response(user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except TokenError:
        pass
    return Response({"message": "Logged out."})


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh(request):
    from rest_framework_simplejwt.views import TokenRefreshView
    return TokenRefreshView.as_view()(request._request)


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_email(request, token):
    try:
        verification = EmailVerificationToken.objects.select_related("user").get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response({"error": "Invalid verification token."}, status=status.HTTP_400_BAD_REQUEST)

    if verification.is_expired:
        return Response({"error": "Verification token has expired."}, status=status.HTTP_400_BAD_REQUEST)

    user = verification.user
    user.is_verified = True
    user.save(update_fields=["is_verified"])
    verification.delete()
    return Response({"message": "Email verified successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    try:
        user = User.objects.get(email=email)
        PasswordResetToken.objects.create(user=user)
        # TODO: send reset email via Celery task (Stage 8)
    except User.DoesNotExist:
        pass  # Don't reveal whether email exists
    return Response({"message": "If that email exists, a reset link has been sent."})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    token_value = serializer.validated_data["token"]
    new_password = serializer.validated_data["new_password"]
    try:
        reset_token = PasswordResetToken.objects.select_related("user").get(
            token=token_value, is_used=False
        )
    except PasswordResetToken.DoesNotExist:
        return Response({"error": "Invalid or used reset token."}, status=status.HTTP_400_BAD_REQUEST)

    if reset_token.is_expired:
        return Response({"error": "Reset token has expired."}, status=status.HTTP_400_BAD_REQUEST)

    user = reset_token.user
    user.set_password(new_password)
    user.save(update_fields=["password"])
    reset_token.is_used = True
    reset_token.save(update_fields=["is_used"])
    return Response({"message": "Password reset successful."})


@api_view(["POST"])
@permission_classes([AllowAny])
def google_oauth(request):
    serializer = GoogleOAuthSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    id_token_str = serializer.validated_data["id_token"]
    role = serializer.validated_data.get("role", User.Role.BUYER)

    try:
        google_client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        id_info = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            google_client_id,
        )
    except ValueError:
        return Response({"error": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

    email = id_info.get("email")
    if not email:
        return Response({"error": "Google account has no email."}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email.split("@")[0],
            "first_name": id_info.get("given_name", ""),
            "last_name": id_info.get("family_name", ""),
            "avatar_url": id_info.get("picture", ""),
            "is_verified": True,
            "role": role,
        },
    )

    return Response(_token_response(user), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
