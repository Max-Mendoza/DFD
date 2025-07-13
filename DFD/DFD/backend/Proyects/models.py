from django.db import models
from users.models import User
# Create your models here.
class Proyect(models.Model):
    owner = models.ForeignKey(User, related_name = "proyects", on_delete=models.CASCADE)
    name = models.CharField( max_length=70)
    subject = models.CharField( max_length=30)
    progress = models.IntegerField()
    date = models.DateField( auto_now_add=True)
    
class Note(models.Model):
    proyect = models.ForeignKey(Proyect, related_name="notes", on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    text= models.TextField()
    date =models.DateField( auto_now_add=True)
    