from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from users.models import User
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(validated_token):
    try:
        user = User.objects.get(id=validated_token['user_id'])
        logger.info(f"Usuario autenticado: {user.name} (ID: {user.id})")
        return user
    except User.DoesNotExist:
        logger.warning(f"Usuario no encontrado con ID: {validated_token.get('user_id')}")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Log para debugging
        logger.info(f"WebSocket connection attempt: {scope.get('path')}")
        
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token")
        
        if token:
            try:
                # Validar el token
                access_token = AccessToken(token[0])
                logger.info(f"Token válido para user_id: {access_token['user_id']}")
                
                # Obtener el usuario
                user = await get_user(access_token)
                scope["user"] = user
                
                if user.is_authenticated:
                    logger.info(f"Usuario autenticado exitosamente: {user.name}")
                else:
                    logger.warning("Usuario no autenticado")
                    
            except (InvalidToken, TokenError) as e:
                logger.error(f"Token inválido: {str(e)}")
                scope["user"] = AnonymousUser()
            except Exception as e:
                logger.error(f"Error en autenticación: {str(e)}")
                scope["user"] = AnonymousUser()
        else:
            logger.warning("No se proporcionó token")
            scope["user"] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
