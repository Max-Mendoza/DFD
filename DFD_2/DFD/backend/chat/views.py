from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from Contacts.models import Contact
from .models import  ChatRoom
from .serializers import (
    ChatRoomSerializer, 
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar salas de chat con mejor debugging"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)
    
    def create(self, request):
        """Crear o obtener sala de chat"""
        other_user_id = request.data.get('other_user_id')
        
        if not other_user_id:
            return Response(
                {'error': 'other_user_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar si son contactos
        are_contacts = Contact.objects.filter(
            Q(sender=request.user, receiver=other_user) | 
            Q(sender=other_user, receiver=request.user),
            state='accepted'
        ).exists()
        
        logger.info(f"Usuarios {request.user.name} y {other_user.name} son contactos: {are_contacts}")
        
        if not are_contacts:
            return Response(
                {'error': 'Solo puedes chatear con tus contactos'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener o crear sala
        room = ChatRoom.get_or_create_room(request.user, other_user)
        logger.info(f"Sala creada/obtenida: {room.id} para usuarios {request.user.name} y {other_user.name}")
        
        serializer = self.get_serializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

# Resto de ViewSets igual que antes...
