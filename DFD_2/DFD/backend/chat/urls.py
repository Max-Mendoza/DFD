from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet

router = DefaultRouter()

router.register(r'chatrooms', ChatRoomViewSet, basename='chatroom')


urlpatterns = [
    path('api/', include(router.urls)),
]