from django.views.generic import TemplateView
from django.urls import path, include, re_path


urlpatterns = [    
    path('users/', include('users.urls')),
    path('analyze/', include('Analisis.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('contacts/', include('Contacts.urls')),
    path('proyects/', include('Proyects.urls')),
    path('ai/', include('IA.urls')),
    path('', include('chat.urls')),
]

urlpatterns+= [re_path(r'^.*', TemplateView.as_view(template_name ='index.html'))]
