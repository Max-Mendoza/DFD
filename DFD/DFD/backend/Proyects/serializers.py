from rest_framework import serializers
from users.models import  User
from . import models
class ProyectSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Proyect
        fields = ["id", "name", "owner", "subject", "progress", "date"]
        read_only_fields = ["owner", "progress", "date"]
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Note
        fields = ["id", "title", "text", "date", "proyect"]
        read_only_fields = ['date']
        