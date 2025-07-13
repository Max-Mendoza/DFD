# en consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']  # Recupera el chat_id de la URL
        self.room_group_name = f'chat_{self.chat_id}'  # Define un nombre para el grupo basado en el chat_id

        # Únete a un grupo de canales que corresponda al chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()  # Acepta la conexión

    async def disconnect(self, close_code):
        # Deja el grupo cuando se desconecta
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recibe un mensaje del WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Enviar mensaje a todos los miembros del grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Recibe mensaje del grupo
    async def chat_message(self, event):
        message = event['message']

        # Enviar el mensaje a través del WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
