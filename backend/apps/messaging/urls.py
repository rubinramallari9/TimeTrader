from django.urls import path
from . import views

urlpatterns = [
    path("conversations/", views.conversations, name="conversations"),
    path("conversations/<uuid:conversation_id>/", views.conversation_detail, name="conversation-detail"),
    path("conversations/<uuid:conversation_id>/messages/", views.send_message, name="send-message"),
    path("unread/", views.unread_count, name="unread-count"),
]
