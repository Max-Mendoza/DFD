from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()

router.register('created', views.ProyectViewsetReader, "proyects_created")
router.register ('notes', views.NoteViewset, 'notes')   
router.register ('', views.ProyectViewset, 'proyects')
urlpatterns = [
    path('tables/', views.GetTables.as_view(), name="tables"),
    path('', include(router.urls)),
    
    
]
