from pymongo import MongoClient
from django.conf import settings
from bson import ObjectId
from pymongo.errors import PyMongoError

def get_formatted_tables(user_id, project_id):
    client = None
    try:
        client = MongoClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB_NAME]
        collection = db.tables

        tables_data = list(collection.find({
            "user_id": int(user_id),
            "project_id": str(project_id)
        }))

        if not tables_data:
            return {"error": "Tablas no encontradas"}

        formatted_datas = {}
        for table in tables_data:
            formatted_datas[table["table_key"]] = {
                "name": table.get("name", ""),
                "description": table.get("description", ""),
                "columns": table.get("columns", []),
                "types": table.get("types", []),
                "values": {
                    col: table.get("values", {}).get(col, [])
                    for col in table.get("columns", [])
                }
            }
        return formatted_datas

    except Exception as e:
        return {"error": str(e)}
    finally:
        if client:
            client.close()
            
