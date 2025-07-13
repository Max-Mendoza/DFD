from .models import Proyect, Note
from .serializers import ProyectSerializer, NoteSerializer
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from .mongo_service import get_formatted_tables
class ProyectViewsetReader(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProyectSerializer
    def get_queryset(self):
        user = self.request.user
        return Proyect.objects.filter(owner = user)
    
class ProyectViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProyectSerializer
    queryset = Proyect.objects.all()
    def perform_create(self, serializer):
        if serializer.is_valid():
            user = self.request.user
            serializer.save(owner= user, progress=0)
        else: 
            print("error en el serializer", serializer.errors)
    
    
class NoteViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    @action(methods=["get"], url_path="created/(?P<proyect_id>[^/.]+)", detail=False)
    def getNotes(self, request, proyect_id=None):
        proyect = get_object_or_404(Proyect, id=proyect_id)
        notes = Note.objects.filter(proyect = proyect)
        serializer = self.get_serializer(notes, many= True)
        return Response(serializer.data)
    
class GetTables(APIView):
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            project_id = request.query_params.get('project_id')  # Cambiado a query_params
            
            if not project_id:
                return Response(
                    {"error": "project_id es requerido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            tables = get_formatted_tables(user.id, project_id)
            
            if "error" in tables:
                return Response(
                    tables,
                    status=status.HTTP_404_NOT_FOUND
                )
                
            return Response(tables)  # Sin llaves adicionales
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    