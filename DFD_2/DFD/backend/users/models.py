from django.conf import settings
from  django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager



class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("Usuarios deben tener un email")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save()
        return user
class User (AbstractBaseUser, PermissionsMixin):
    email = models.EmailField( max_length=254, unique=True)
    name = models.CharField( max_length=50, default='JohnDoe')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects =  UserAccountManager()
    
    USERNAME_FIELD= 'email'
    REQUIRED_FIELDS = ['name']
    
    def get_full_name(self):
        return self.name
    def get_short_name(self):
        return self.name
    def __str__(self):
        return self.email

