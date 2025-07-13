from datetime import datetime
import json
from pymongo import MongoClient
from bson import ObjectId
from pymongo import MongoClient
from django.conf import settings
from rapidfuzz import fuzz, process
client = MongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]



MONGO_OPERATORS = {
    "eq": "$eq",
    "gt": "$gt",
    "lt": "$lt",
    "gte": "$gte",
    "lte": "$lte",
    "ne": "$ne",
    "in": "$in"
}

def get_tables(user_id, project_id):
    collection = db.tables
    result = collection.find({
        "user_id": int(user_id),
        "project_id": project_id
    }, {"name": 1})
        
    return ([doc["name"] for doc in result]  )

def get_columns(user_id, project_id):
    result = db.tables.find(
        {"user_id": int(user_id), "project_id": project_id},
        {"columns": 1, "_id": 0}  # Excluir _id para mayor claridad
    )
    return list(result)


def table_exists(user_id, project_id, table_key):
    collection = db.tables
    exists = collection.find_one({
        "table_key": table_key,
        "user_id": int(user_id),
        "project_id": project_id
    }) is not None
    return exists

def validate_query(user_id, project_id, table_key):
    if table_exists(user_id, project_id, table_key):
        collection = db.tables
        table = collection.find_one({
            "table_key": table_key,
            "user_id": int(user_id),
            "project_id": project_id
        })
        return str(table["_id"])
    return None
def build_filter_mongo(filters_json):
    query = {}
    for f in filters_json:
        field = f.get("field")
        operator = MONGO_OPERATORS.get(f.get("operator"))
        value = f.get("value")
        if field and operator:
            query[field] = {operator: value}
    return query

# Execute Mongo query
def execute_query(collection_name, filters, fields=None, limit=20):
    print(f"DEBUG: Buscando collection_name: '{collection_name}'")
    
    table = db.tables.find_one({"table_key": collection_name})
    print(f"DEBUG: Tabla encontrada: {table is not None}")
    
    if not table:
        return []

    print(f"DEBUG: table['values'] keys: {list(table['values'].keys()) if table.get('values') else 'No values'}")
    
    
    rows = pivot_columnar_table(table["values"])
    
    aggregation = None
    aggregation_field = None

    if isinstance(filters, dict):
        aggregation = filters.get("aggregation")
        aggregation_field = filters.get("aggregation_field")

    if aggregation and aggregation_field:
        if not rows:
            return []

        try:
            if aggregation == "max":
                max_row = max(rows, key=lambda r: r.get(aggregation_field, float('-inf')))
                return [max_row]
            elif aggregation == "min":
                min_row = min(rows, key=lambda r: r.get(aggregation_field, float('inf')))
                return [min_row]
        except Exception as e:
            print("⚠️ Error al aplicar agregación:", e)

    print(f"DEBUG: Total rows after pivot: {len(rows)}")
    print(f"DEBUG: First row sample: {rows[1] if rows else 'No rows'}")
    
    print(f"DEBUG: Applying filters: {filters}")
    filtered = apply_filters_to_rows(rows, filters)
    print(f"DEBUG: Rows after filtering: {len(filtered)}")
    
    selected = [
        {k: r[k] for k in fields if k in r} if fields else r
        for r in filtered
    ]
    print(selected[:limit])
    return selected[:limit]

def get_relevant_tables(prompt, user_id, project_id, umbral=70):
    tables_name = get_tables(user_id=user_id, project_id=project_id)
    
    similar_tables = process.extract(
        prompt, 
        tables_name, 
        scorer=fuzz.partial_ratio,
        limit=None,
        score_cutoff=umbral
    )
    
    return [table[0] for table in similar_tables]  # Extrae solo el nombre (primer elemento de cada tupla)

def build_prompt_with_context(question, user_id, project_id):
    
    tables_name = get_relevant_tables(prompt= question, user_id=user_id, project_id=project_id)
    
    
    schema = get_schema_context(user_id=user_id,project_id= project_id, tables_name=tables_name)
    
    schema_json = json.dumps(schema, ensure_ascii=False, indent=2)
    print("DEBUG schema json:", schema_json)

    prompt = f"""
    Eres un asistente experto en análisis de datos que interpreta preguntas en lenguaje natural para MongoDB.
    

    Si no aplica agregación, omite esos campos.

    Tu tarea es traducir la consulta del usuario en un JSON válido que incluya:
    
    - collection: nombre exacto de la tabla ('table_key')
    - fields: lista precisa de campos existentes a mostrar
    - filters: lista con filtros que contengan 'field', 'operator' (eq, gt, lt, etc.) y 'value'
    - response_text: una explicación clara y directa que responda la consulta de forma natural y útil
    Si el usuario pide "el producto más vendido", "el menor precio", "el cliente con más compras", etc.,
    responde también con los campos:
    - aggregation: "max" o "min"
    - aggregation_field: el campo por el cual hacer la agregación

    Utiliza solo los nombres de tablas y columnas que aparecen en el siguiente esquema. No inventes ni traduzcas campos.

    Si el usuario pide un campo inexistente, responde exclusivamente con: "No puedo encontrar ese campo en los datos disponibles."

    Este es el esquema de datos:

    {schema_json}

    Devuelve únicamente un objeto JSON válido que siga la estructura mencionada, sin texto extra.

    Consulta:
    {question}
    """



    return prompt
def pivot_columnar_table(values_dict):
    if not values_dict:
        return []

    keys = list(values_dict.keys())
    num_rows = len(values_dict[keys[0]])
    rows = []

    for i in range(num_rows):
        row = {key: values_dict[key][i] for key in keys if i < len(values_dict[key])}
        rows.append(row)

    return rows
def apply_filters_to_rows(rows, filters):
    def match(row, condition):
        field = condition["field"]
        operator = condition["operator"]
        value = condition["value"]
        actual = row.get(field)

        if actual is None:
            return False
        if isinstance(actual, str) and isinstance(value, str):
            import unicodedata
            actual_norm = unicodedata.normalize('NFD', actual).encode('ascii', 'ignore').decode('ascii').lower()
            value_norm = unicodedata.normalize('NFD', value).encode('ascii', 'ignore').decode('ascii').lower()
            if operator == "eq": return actual_norm == value_norm
            if operator == "gt": return actual > value
            if operator == "lt": return actual < value
            if operator == "gte": return actual >= value
            if operator == "lte": return actual <= value
            if operator == "ne": return actual != value
            if operator == "in": return actual in value if isinstance(value, list) else False
        if operator == "eq": return actual == value
        return False
        
    for condition in filters:
        rows = [row for row in rows if match(row, condition)]

    return rows
def get_schema_context(user_id, project_id, tables_name):
    collection = db.tables
    context = []
    print(tables_name)
    for table_name in tables_name:
        table = collection.find_one(
            {
                "user_id": int(user_id),
                "project_id": project_id,
                "name": table_name
            },
            {
                "table_key": 1,
                "name": 1,
                "columns": 1,
                "_id": 0     
            }
        )
        print(table_name)
        print(table)
        
        
        if table:
            columns = [
                {"name": col}
                for col in zip(table.get("columns", []))
            ]
            
            context.append({
                "table_key": table.get("table_key"),
                "name": table.get("name"),
                "columns": columns
            })
    
    return context