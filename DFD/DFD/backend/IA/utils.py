import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

def is_numeric(value: Any) -> bool:
    """Verifica si un valor es numérico"""
    try:
        float(value)
        return True
    except (ValueError, TypeError):
        return False

def detect_field_type(values: List[Any]) -> str:
    """Detecta el tipo de datos de un campo basado en sus valores"""
    if not values:
        return "unknown"
    
    # Eliminar valores nulos
    non_null_values = [v for v in values if v is not None]
    if not non_null_values:
        return "null"
    
    # Verificar si son números
    numeric_count = sum(1 for v in non_null_values if is_numeric(v))
    if numeric_count / len(non_null_values) > 0.8:
        return "numeric"
    
    # Verificar si son fechas
    date_patterns = [
        r'\d{4}-\d{2}-\d{2}',
        r'\d{2}/\d{2}/\d{4}',
        r'\d{2}-\d{2}-\d{4}'
    ]
    
    date_count = 0
    for value in non_null_values:
        str_value = str(value)
        for pattern in date_patterns:
            if re.match(pattern, str_value):
                date_count += 1
                break
    
    if date_count / len(non_null_values) > 0.8:
        return "date"
    
    return "text"

def generate_field_insights(data: List[Dict[str, Any]]) -> Dict[