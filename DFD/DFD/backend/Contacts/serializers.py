from rest_framework import serializers
from users.models import  User
from . import models
class ContactSerializer(serializers.ModelSerializer):
    receiver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    
    class Meta:
        model = models.Contact
        fields = ["id", "state", "receiver", "sender"]
        read_only_fields = ["sender"]
        
        