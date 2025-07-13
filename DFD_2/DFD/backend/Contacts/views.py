from rest_framework import viewsets, status, permissions
from django.db.models import Q
from . import serializers
from rest_framework.response import Response
from .models import Contact
from rest_framework.decorators import action 
from users.serializers import UserSerializer
from users.models import User

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.ContactSerializer
    queryset = Contact.objects.all()
    def perform_create(self, serializer):   
        if serializer.is_valid():
            serializer.save(sender=self.request.user)
        else:
            print("Errores del serializer:", serializer.errors)
            
    @action(detail=False, methods=['delete'], url_path="delete")
    def delete_by_user(self,request):
        user_two = request.data.get('user_two')
        user = self.request.user
        if not user_two:
            return Response(
                {"error": "El campo 'user_two' es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact= Contact.objects.filter(Q(sender=user, receiver=user_two) | Q(sender= user_two, receiver=user))
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=False, methods=["patch"], url_path="accept")
    def acceptRequest(self, request):
        user_two = request.data.get('user_two')
        user = self.request.user
        print(user_two)
        contact= Contact.objects.filter( sender= user_two, receiver=user, state="pending").first()
        contact.state= "accepted"
        contact.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
        

class UsersContactsNotSent(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        user = self.request.user
        print("user", user)
        print("id", user.id)
        sent = user.sent_requests.filter(Q(state="accepted") | Q(state="pending")).values_list('receiver', flat=True)
        received = user.received_requests.filter(Q(state="accepted") | Q(state="pending")).values_list('sender', flat=True)
        contacts = list(sent) + list(received)
        return User.objects.exclude(id__in=contacts).exclude(id=self.request.user.id)    
        
class UserContactsAccepted(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        user = self.request.user
        sent = user.sent_requests.filter(state="accepted").values_list('receiver', flat=True)
        received = user.received_requests.filter(state="accepted").values_list('sender', flat=True)
        contacts = list(sent) + list(received)
        return User.objects.filter(id__in=contacts)
        
class UserContactsPendingSent(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        user = self.request.user
        receivers = Contact.objects.filter(sender= user, state= "pending").values_list('receiver', flat=True)
        contacts_pending = list(receivers)
        return User.objects.filter(id__in= contacts_pending)
class UserContactsPendingReceived(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    def get_queryset(self):
        user = self.request.user
        senders = Contact.objects.filter(receiver= user, state= "pending").values_list('sender', flat=True)
        contacts_pending = list(senders)
        return User.objects.filter(id__in= contacts_pending)