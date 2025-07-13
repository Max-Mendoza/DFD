# serializers.py
from rest_framework import serializers
from users.models import User
from Contacts.models import Contact
from .models import  ChatRoom, Message, UserProfile

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'name', 'email']
    
    

class ContactSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Contact"""
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Contact
        fields = ['id', 'sender', 'receiver', 'state']

class MessageSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Message"""
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_id', 'content', 'timestamp', 'is_read', 'message_type']
        read_only_fields = ['id', 'timestamp']

class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ChatRoom"""
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """Obtiene el último mensaje de la sala"""
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None
    
    def get_unread_count(self, obj):
        """Obtiene el número de mensajes no leídos"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil del usuario"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'is_online', 'last_seen']