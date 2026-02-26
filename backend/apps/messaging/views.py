from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.listings.models import Listing
from .models import Conversation, Message
from .serializers import ConversationListSerializer, ConversationDetailSerializer, MessageSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversations(request):
    """
    GET  — list all conversations the current user is part of.
    POST — start (or retrieve) a conversation as a buyer.
           Body: { listing_id, message }
    """
    if request.method == "GET":
        qs = (
            Conversation.objects
            .filter(Q(buyer=request.user) | Q(seller=request.user))
            .select_related("listing", "buyer", "seller")
            .prefetch_related("messages")
        )
        return Response(ConversationListSerializer(qs, many=True, context={"request": request}).data)

    # POST — buyer starts conversation
    listing_id = request.data.get("listing_id")
    message_text = request.data.get("message", "").strip()

    if not listing_id:
        return Response({"error": "listing_id is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not message_text:
        return Response({"error": "message is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        listing = Listing.objects.select_related("seller").get(id=listing_id, status="active")
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    if listing.seller == request.user:
        return Response({"error": "You cannot message yourself."}, status=status.HTTP_400_BAD_REQUEST)

    conversation, created = Conversation.objects.get_or_create(
        listing=listing,
        buyer=request.user,
        defaults={"seller": listing.seller},
    )

    Message.objects.create(conversation=conversation, sender=request.user, content=message_text)
    conversation.save()  # bump updated_at

    return Response(
        ConversationDetailSerializer(conversation, context={"request": request}).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def conversation_detail(request, conversation_id):
    """GET — fetch conversation with all messages; marks received messages as read."""
    try:
        conversation = Conversation.objects.select_related("listing", "buyer", "seller").prefetch_related("messages__sender").get(
            id=conversation_id
        )
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in (conversation.buyer, conversation.seller):
        return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    # Mark all messages from the other party as read
    conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

    return Response(ConversationDetailSerializer(conversation, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    """POST — send a message in an existing conversation."""
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in (conversation.buyer, conversation.seller):
        return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    content = request.data.get("content", "").strip()
    if not content:
        return Response({"error": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    message = Message.objects.create(conversation=conversation, sender=request.user, content=content)
    conversation.save()  # bump updated_at

    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """GET — total unread message count for the current user (for navbar badge)."""
    from django.db.models import Count
    total = (
        Message.objects
        .filter(
            Q(conversation__buyer=request.user) | Q(conversation__seller=request.user)
        )
        .exclude(sender=request.user)
        .filter(is_read=False)
        .count()
    )
    return Response({"unread": total})
