from .views import(  CustomLoginView, RefreshAccessTokenView, LogoutView, AuthenticatedUserView, UserList)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register("", UserList, basename="users")

urlpatterns = [
    
    path('auth/login/', CustomLoginView.as_view(), name='custom-login'),
    path('auth/refreshtoken/', RefreshAccessTokenView.as_view(), name='refresh-token'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', AuthenticatedUserView.as_view(), name='auth-me'),    
    path('', include(router.urls)),
]
