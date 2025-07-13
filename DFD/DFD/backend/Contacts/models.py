from django.db import models
from users.models import User
# Create your models here.
class Contact(models.Model):
    STATES = (
        ('pending', 'Pending'),      
        ('accepted', 'Accepted'),
        ('denied', 'Denied'),
        ('not_sent', 'Not Sent'),
    )

    sender = models.ForeignKey(User, related_name = "sent_requests", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_requests", on_delete=models.CASCADE)
    state = models.CharField(max_length=15, choices= STATES, default="not_sent")
    