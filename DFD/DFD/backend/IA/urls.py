from rest_framework.urls import urlpatterns, path
from .views import QueryMongoIA, GenerateChart
urlpatterns = [
    path('question/', QueryMongoIA.as_view(), name='query'),  
    path('chart/', GenerateChart.as_view(), name='generate_chart'),  
]