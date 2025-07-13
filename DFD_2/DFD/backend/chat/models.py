# models.py
from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
from django.utils import timezone

class Contact(models.Model):
    """Modelo para gestionar contactos entre usuarios"""
    STATE_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('blocked', 'Bloqueado'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_contacts')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_contacts')
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['sender', 'receiver']
    
    def __str__(self):
        return f"{self.sender.name} -> {self.receiver.name} ({self.state})"

class ChatRoom(models.Model):
    """Modelo para las salas de chat entre contactos"""
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        users = self.participants.all()
        if users.count() == 2:
            return f"Chat: {users[0].name} & {users[1].name}"
        return f"Chat Room {self.id}"
    
    @classmethod
    def get_or_create_room(cls, user1, user2):
        """Obtiene o crea una sala de chat entre dos usuarios"""
        room = cls.objects.filter(
            participants=user1
        ).filter(
            participants=user2
        ).first()
        
        if not room:
            room = cls.objects.create()
            room.participants.add(user1, user2)
        
        return room

class Message(models.Model):
    """Modelo para los mensajes del chat"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    message_type = models.CharField(max_length=20, default='text')  # text, image, file, etc.
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.name}: {self.content[:50]}..."

class UserProfile(models.Model):
    """Perfil extendido del usuario para el chat"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.name} - {'Online' if self.is_online else 'Offline'}"