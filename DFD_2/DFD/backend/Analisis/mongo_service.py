from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from pymongo import MongoClient
from django.conf import settings
from pymongo.server_api import ServerApi

client = MongoClient(settings.MONGO_URI,server_api=ServerApi('1'))
db = client[settings.MONGO_DB_NAME]



def create_single_table(table_key, table_data, user_id, project_id):
    collection = db.tables
    document = {
        'table_key': table_key,
        'name': table_data.get('name', ''),
        'description': table_data.get('description', ''),
        'columns': table_data.get('columns', []),
        'types': table_data.get('types', []),
        'values': table_data.get('values', []),
        # Metadatos automáticos
        'user_id': user_id,
        'project_id': project_id,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    result = collection.insert_one(document)
    return result
def verify_existence(table_key, project_id, user_id):
    exists = db.tables.find_one({'table_key': table_key, 'project_id': project_id, 'user_id': int(user_id)})
    return exists
    