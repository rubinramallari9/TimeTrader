from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.users.urls.auth")),
    path("api/v1/users/", include("apps.users.urls.users")),
    path("api/v1/listings/", include("apps.listings.urls")),
    path("api/v1/stores/", include("apps.stores.urls")),
    path("api/v1/repairs/", include("apps.repairs.urls")),
    path("api/v1/authentication/", include("apps.authentication.urls")),
    path("api/v1/orders/", include("apps.transactions.urls")),
    path("api/v1/messages/", include("apps.messaging.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
