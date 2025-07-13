from django.contrib.auth import get_user_model  
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import AccessToken, TokenError, RefreshToken
from rest_framework import generics
from rest_framework import viewsets

User = get_user_model()





User = get_user_model()

class AuthenticatedUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')

        if not access_token:
            return Response({"error": "No access token"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = AccessToken(access_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)

            return Response({
                "id": user.id,
                "username": user.name,
                "email": user.email
            }, status=status.HTTP_200_OK)

        except TokenError:
            # Token expirado o inválido, intentamos refrescar
            if refresh_token:
                try:
                    refresh = RefreshToken(refresh_token)
                    new_access = str(refresh.access_token)

                    # Extrae el usuario
                    user_id = refresh['user_id']
                    user = User.objects.get(id=user_id)

                    # Devuelve nuevo access_token en cookies
                    response = Response({
                        "id": user.id,
                        "username": user.name,
                        "email": user.email
                    }, status=status.HTTP_200_OK)
                    response.set_cookie(
                        key="access_token",
                        value=new_access,
                        httponly=True,
                        secure=True,
                        samesite="Lax",
                        max_age=3600  # 1 hora, ajusta según tu necesidad
                    )
                    return response

                except TokenError:
                    return Response({"error": "Refresh token inválido"}, status=status.HTTP_401_UNAUTHORIZED)
                except User.DoesNotExist:
                    return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

            return Response({"error": "Token inválido o expirado"}, status=status.HTTP_401_UNAUTHORIZED)



#Esta shit para borrar las cookies y blacklistear los tokens
class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        response = Response({"message": "Logout exitoso"}, status=status.HTTP_200_OK)

        # Borrar cookies
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')

        # Intentar blacklistear el refresh token
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Esto requiere activar blacklisting
            except TokenError:
                pass  # Si el token ya está expirado, no pasa nada

        return response

#Aqui es pa el login y obtener el access y refresh
class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({"message": "Login exitoso"}, status=status.HTTP_200_OK)
            
            # Guardamos los tokens en cookies
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                samesite='Lax',
                secure=False,  # Cambia a True en producción con HTTPS
                max_age=15 * 60  # 15 minutos
            )

            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                samesite='Lax',
                secure=False,
                max_age=7 * 24 * 60 * 60  # 7 días
            )

            return response

        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
# Aqui es una fakin vista pa el refresh token y generar un access
class RefreshAccessTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)

            response = Response({"message": "Access token refreshed"}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                samesite='Lax',
                secure=False,  #  Cambiar a True en producción
                max_age=15 * 60  # 15 minutos
            )
            return response

        except TokenError:
            return Response({"error": "Refresh token inválido o expirado"}, status=status.HTTP_401_UNAUTHORIZED)

# Aca va estar la shit para poder enviar una lista de usuarios jaja
class UserList(viewsets.ReadOnlyModelViewSet):
    
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        print("user", self.request.user)
        print("id", self.request.user.id)
        return User.objects.exclude(id= self.request.user.id)

        
        
        
    
    