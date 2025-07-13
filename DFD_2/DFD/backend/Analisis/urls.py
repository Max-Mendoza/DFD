from .views import FileUploadView, CleanTransformView, FilterDataView, ColumnSummaryView, FileReturnJSONView, FileUploadToDB, DataCleanerView
from django.urls import path


urlpatterns = [
    path('file/', FileReturnJSONView.as_view(), name='file_JSON_structure'),  
    path('upload/', FileUploadView.as_view(), name='upload_file'),  
    path('clean/', CleanTransformView.as_view(), name='clean_file'),  
    path('filter/', FilterDataView.as_view(), name='filter_data'),  
    path('summary/', ColumnSummaryView.as_view(), name='parser_data'),    
    path('file/save/', FileUploadToDB.as_view(), name='file_save'),   
    path('file/data-cleaner/', DataCleanerView.as_view(), name='data-cleaner'), 
    
]


