from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserPublicSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender", "content", "is_read", "created_at")


class ConversationListSerializer(serializers.ModelSerializer):
    buyer        = UserPublicSerializer(read_only=True)
    seller       = UserPublicSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_brand = serializers.CharField(source="listing.brand", read_only=True)
    listing_id    = serializers.UUIDField(source="listing.id", read_only=True)

    class Meta:
        model = Conversation
        fields = (
            "id", "listing_id", "listing_title", "listing_brand",
            "buyer", "seller", "last_message", "unread_count",
            "created_at", "updated_at",
        )

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if not msg:
            return None
        return {"content": msg.content, "sender_id": str(msg.sender_id), "created_at": msg.created_at}

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if request:
            return obj.unread_count_for(request.user)
        return 0


class ConversationDetailSerializer(ConversationListSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ConversationListSerializer.Meta):
        fields = ConversationListSerializer.Meta.fields + ("messages",)
