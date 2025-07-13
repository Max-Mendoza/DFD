import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, UserProfile
from .serializers import MessageSerializer
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """Consumer para WebSocket del chat con mejor manejo de errores"""
    
    async def connect(self):
        """Conectar al WebSocket con debugging mejorado"""
        try:
            # Obtener el ID de la sala del URL
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'chat_{self.room_id}'
            
            logger.info(f"Intento de conexión a sala {self.room_id}")
            
            # Verificar autenticación
            self.user = self.scope['user']
            logger.info(f"Usuario en scope: {self.user}, autenticado: {self.user.is_authenticated}")
            
            if not self.user.is_authenticated:
                logger.warning(f"Usuario no autenticado intentando conectar a sala {self.room_id}")
                await self.close(code=4001)  # Código personalizado para no autenticado
                return
            
            # Verificar si el usuario puede acceder a esta sala
            has_access = await self.check_room_access()
            logger.info(f"Usuario {self.user.name} tiene acceso a sala {self.room_id}: {has_access}")
            
            if not has_access:
                logger.warning(f"Usuario {self.user.name} sin acceso a sala {self.room_id}")
                await self.close(code=4003)  # Código personalizado para sin acceso
                return
            
            # Unirse al grupo de la sala
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Actualizar estado del usuario a online
            await self.update_user_status(True)
            
            # Aceptar la conexión
            await self.accept()
            logger.info(f"Conexión aceptada para usuario {self.user.name} en sala {self.room_id}")
            
            # Notificar a otros usuarios que este usuario se conectó
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status_update',
                    'user_id': self.user.id,
                    'status': 'online'
                }
            )
            
        except Exception as e:
            logger.error(f"Error en connect: {str(e)}")
            await self.close(code=4000)  # Error interno
    
    async def disconnect(self, close_code):
        """Desconectar del WebSocket"""
        logger.info(f"Desconectando usuario {getattr(self.user, 'name', 'Unknown')} de sala {getattr(self, 'room_id', 'Unknown')}, código: {close_code}")
        
        if hasattr(self, 'room_group_name'):
            # Salir del grupo de la sala
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            # Actualizar estado del usuario a offline
            if hasattr(self, 'user') and self.user.is_authenticated:
                await self.update_user_status(False)
                
                # Notificar a otros usuarios que este usuario se desconectó
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_status_update',
                        'user_id': self.user.id,
                        'status': 'offline'
                    }
                )
    
    async def receive(self, text_data):
        """Recibir mensaje del WebSocket"""
        try:
            text_data_json = json.loads(text_data)
            action = text_data_json.get('action')
            
            logger.info(f"Acción recibida: {action} de usuario {self.user.name}")
            
            if action == 'send_message':
                await self.handle_send_message(text_data_json)
            elif action == 'typing':
                await self.handle_typing(text_data_json)
            elif action == 'stop_typing':
                await self.handle_stop_typing(text_data_json)
            elif action == 'mark_as_read':
                await self.handle_mark_as_read(text_data_json)
            else:
                logger.warning(f"Acción desconocida: {action}")
                
        except Exception as e:
            logger.error(f"Error procesando mensaje: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': f'Error procesando mensaje: {str(e)}'
            }))
    
    # ... resto de métodos igual que antes ...
    
    @database_sync_to_async
    def check_room_access(self):
        """Verificar si el usuario puede acceder a la sala con mejor logging"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            has_access = room.participants.filter(id=self.user.id).exists()
            
            # Log adicional para debugging
            participants = list(room.participants.values_list('id', 'name'))
            logger.info(f"Sala {self.room_id} participantes: {participants}")
            logger.info(f"Usuario {self.user.id} ({self.user.name}) tiene acceso: {has_access}")
            
            return has_access
        except ChatRoom.DoesNotExist:
            logger.error(f"Sala {self.room_id} no existe")
            return False
        except Exception as e:
            logger.error(f"Error verificando acceso a sala: {str(e)}")
            return False
    
    @database_sync_to_async
    def save_message(self, content):
        """Guardar mensaje en la base de datos"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.create(
                room=room,
                sender=self.user,
                content=content
            )
            # Actualizar timestamp de la sala
            room.save()
            return message
        except Exception as e:
            logger.error(f"Error guardando mensaje: {str(e)}")
            return None
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Serializar mensaje para envío"""
        return MessageSerializer(message).data
    
    @database_sync_to_async
    def mark_messages_as_read(self):
        """Marcar mensajes como leídos"""
        try:
            updated = Message.objects.filter(
                room_id=self.room_id,
                is_read=False
            ).exclude(sender=self.user).update(is_read=True)
            logger.info(f"Marcados {updated} mensajes como leídos")
        except Exception as e:
            logger.error(f"Error marcando mensajes como leídos: {str(e)}")
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        """Actualizar estado del usuario"""
        try:
            profile, created = UserProfile.objects.get_or_create(
                user=self.user,
                defaults={'is_online': is_online}
            )
            if not created:
                profile.is_online = is_online
                profile.save()
            logger.info(f"Estado de usuario {self.user.name} actualizado: {'online' if is_online else 'offline'}")
        except Exception as e:
            logger.error(f"Error actualizando estado de usuario: {str(e)}")
    
    # Handlers para enviar mensajes al WebSocket
    async def chat_message(self, event):
        """Enviar mensaje de chat"""
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))
    
    async def typing_indicator(self, event):
        """Enviar indicador de escritura"""
        # No enviar el indicador al mismo usuario que está escribiendo
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'name': event['name'],
                'is_typing': event['is_typing']
            }))
    
    async def user_status_update(self, event):
        """Enviar actualización de estado de usuario"""
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))
    
    async def messages_read(self, event):
        """Enviar notificación de mensajes leídos"""
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'user_id': event['user_id']
        }))
    
    async def handle_send_message(self, data):
        """Manejar envío de mensaje"""
        content = data.get('content', '').strip()
        if not content:
            return
        
        # Guardar mensaje en la base de datos
        message = await self.save_message(content)
        if message:
            # Serializar mensaje
            message_data = await self.serialize_message(message)
            
            # Enviar mensaje a todos los usuarios en la sala
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )
    
    async def handle_typing(self, data):
        """Manejar indicador de "escribiendo" """
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'name': self.user.name,
                'is_typing': True
            }
        )
    
    async def handle_stop_typing(self, data):
        """Manejar indicador de "dejó de escribir" """
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'name': self.user.name,
                'is_typing': False
            }
        )
    
    async def handle_mark_as_read(self, data):
        """Manejar marcado de mensajes como leídos"""
        await self.mark_messages_as_read()
        
        # Notificar actualización de estado de lectura
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'messages_read',
                'user_id': self.user.id
            }
        )
