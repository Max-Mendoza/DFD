import polars as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser



from Proyects.models import Proyect
from .mongo_service import create_single_table, verify_existence




class FileReturnJSONView(APIView):
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        df = pd.read_csv(file.read())
        filename = file.name.replace(".csv", '')
        types = [str(dtype).split(".")[-1] for dtype in df.schema.values()]
        map_to_ts = {
            "Int64": "number",
            "Float64": "number",
            "Utf8": "string",
            "String": "string",
            "Boolean": "boolean",
            "Date": "Date",  # o "string"
            "Datetime": "Date",
        }
        types_ts = [map_to_ts.get(type, "unknown") for type in types]
        print(df.schema)
        
        return Response({
            "name": filename,
            "description": "Esto es por default, luego modifico la ui para que sea posible esto",
            "columns": df.columns,
            "values": df.to_dict(as_series=False),
            "types": types_ts
        })
        
class FileUploadToDB(APIView):
    def post(self, request):
        user = request.user
        tables = request.data.get('tables', {})
        project_id = request.data.get('projectId')

        inserted = []
        skipped = []

        for table_key, table_data in tables.items():
            # Verificamos si ya existe la tabla con table_key y project_id
            exists = verify_existence(table_key=table_key, project_id=project_id, user_id=user.id)

            if exists:
                # Si ya existe, no insertamos, solo registramos que la saltamos
                skipped.append(table_key)
                continue

            # Si no existe, insertamos
            result = create_single_table(
                table_key=table_key,
                table_data=table_data,
                user_id=user.id,
                project_id=project_id
            )
            inserted.append(table_key)

        return Response({
            'message': 'Proceso completado'
        })
        
    

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No se recibió ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Detectar tipo de archivo
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith('.xls') or file.name.endswith('.xlsx'):
                df = pd.read_excel(file)
            else:
                return Response({"error": "Formato no soportado"}, status=status.HTTP_400_BAD_REQUEST)

            # Aquí haces limpieza o transformación
            df.dropna(inplace=True)  # Ejemplo simple: eliminar filas vacías

            # Convertimos a JSON para devolver
            data = df.to_dict(orient='records')

            return Response({"data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CleanTransformView(APIView):
    parser_classes = [MultiPartParser]
    

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        transformations = request.data.get("transformations", {})

        if not uploaded_file:
            return Response({"error": "No se proporcionó ningún archivo"}, status=400)

        try:
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(".xlsx") or uploaded_file.name.endswith(".xls"):
                df = pd.read_excel(uploaded_file)
            else:
                return Response({"error": "Formato no soportado"}, status=400)

            # 👇 Ejemplos de transformación:
            if transformations.get("drop_nulls"):
                df.dropna(inplace=True)

            if "rename_columns" in transformations:
                df.rename(columns=transformations["rename_columns"], inplace=True)

            # Solo para devolver un resumen rápido del resultado
            return Response({
                "columnas": df.columns.tolist(),
                "filas": len(df),
                "head": df.head().to_dict(orient="records")
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ColumnSummaryView(APIView):
    parser_classes = [MultiPartParser]
    

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        column_name = request.data.get("column")

        if not uploaded_file or not column_name:
            return Response({"error": "Archivo o columna faltante"}, status=400)

        try:
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(".xlsx") or uploaded_file.name.endswith(".xls"):
                df = pd.read_excel(uploaded_file)
            else:
                return Response({"error": "Formato no soportado"}, status=400)

            if column_name not in df.columns:
                return Response({"error": "Columna no encontrada"}, status=400)

            col = df[column_name]

            if pd.api.types.is_numeric_dtype(col):
                return Response({
                    "count": int(col.count()),
                    "mean": float(col.mean()),
                    "median": float(col.median()),
                    "mode": col.mode().tolist(),
                    "min": float(col.min()),
                    "max": float(col.max()),
                    "std": float(col.std()),
                })
            else:
                value_counts = col.value_counts().to_dict()
                return Response({
                    "value_counts": value_counts
                })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
class FilterDataView(APIView):
    parser_classes = [MultiPartParser]
    

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        filters = request.data.get("filters", {})

        if not uploaded_file:
            return Response({"error": "Archivo faltante"}, status=400)

        try:
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(".xlsx") or uploaded_file.name.endswith(".xls"):
                df = pd.read_excel(uploaded_file)
            else:
                return Response({"error": "Formato no soportado"}, status=400)

            # 🔍 Aplicar filtros: Ej. { "edad": { "gt": 20 }, "sexo": { "eq": "F" } }
            for col, condition in filters.items():
                if "eq" in condition:
                    df = df[df[col] == condition["eq"]]
                if "gt" in condition:
                    df = df[df[col] > float(condition["gt"])]
                if "lt" in condition:
                    df = df[df[col] < float(condition["lt"])]

            return Response({
                "filtrado": df.head(10).to_dict(orient="records"),
                "filas_restantes": len(df)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# views.py
import re
import polars as pl
import unicodedata
from decimal import Decimal, InvalidOperation
from datetime import datetime
from typing import Dict, List, Any, Union
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class DataCleanerView(APIView):
    """
    Vista ultra potente para limpiar datos usando Polars y regex.
    Maneja casos especiales como problemas de UTF-8, caracteres especiales, ASCII, etc.
    """
    
    def __init__(self):
        super().__init__()
        
        # Patrones regex compilados para mejor rendimiento
        self.compiled_patterns = {
            'email': re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
            'phone': re.compile(r'[\+]?[1-9]?[0-9]{7,15}'),
            'special_chars': re.compile(r'[^\w\s\-.,@#$%&()[\]{}":;!?+=*/\\|<>~`^]'),
            'multiple_spaces': re.compile(r'\s+'),
            'leading_trailing_spaces': re.compile(r'^\s+|\s+$'),
            'non_printable': re.compile(r'[\x00-\x1f\x7f-\x9f]'),
            'malformed_utf8': re.compile(r'[^\x00-\x7F\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF]'),
            'numeric_with_text': re.compile(r'^[\d\s\-+.,]+$'),
            'date_patterns': [
                re.compile(r'^\d{4}-\d{2}-\d{2}$'),  # YYYY-MM-DD
                re.compile(r'^\d{2}/\d{2}/\d{4}$'),  # DD/MM/YYYY
                re.compile(r'^\d{2}-\d{2}-\d{4}$'),  # DD-MM-YYYY
                re.compile(r'^\d{4}/\d{2}/\d{2}$'),  # YYYY/MM/DD
            ]
        }
        
        # Mapeo de caracteres mal codificados comunes
        self.encoding_fixes = {
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
            'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã"': 'Ó', 'Ãš': 'Ú',
            'Ã±': 'ñ', "Ã'": 'Ñ', 'Ã¼': 'ü', 'Ãœ': 'Ü',
            'â€™': "'", 'â€œ': '"', 'â€': '"', 'â€"': '–', 'â€"': '—',
            'Â´': "'", 'Â¿': '¿', 'Â¡': '¡', 'Â°': '°', 'Â®': '®',
            'Â©': '©', 'Â«': '«', 'Â»': '»', 'â‚¬': '€'
        }

    def post(self, request):
        """
        Endpoint principal para limpiar datos
        Devuelve EXACTAMENTE la misma estructura pero con datos limpios
        """
        try:
            data = request.data
            
            # Validar estructura de datos
            if not self._validate_data_structure(data):
                return Response({
                    'error': 'Estructura de datos inválida',
                    'expected_structure': {
                        'name': 'string',
                        'description': 'string', 
                        'columns': ['list of strings'],
                        'types': ['list of types'],
                        'values': {'column_name': ['list of values']}
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Limpiar datos manteniendo estructura original
            cleaned_data = self._clean_data_preserve_structure(data)
            
            # Respuesta con la MISMA estructura que el frontend espera
            return Response(cleaned_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error en limpieza de datos: {str(e)}")
            return Response({
                'error': 'Error interno al procesar los datos',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _validate_data_structure(self, data: Dict) -> bool:
        """
        Valida que la estructura de datos sea correcta
        """
        required_keys = ['name', 'description', 'columns', 'types', 'values']
        
        if not all(key in data for key in required_keys):
            return False
        
        if not isinstance(data['columns'], list) or not isinstance(data['types'], list):
            return False
        
        if len(data['columns']) != len(data['types']):
            return False
        
        if not isinstance(data['values'], dict):
            return False
        
        # Verificar que todas las columnas estén en values
        for col in data['columns']:
            if col not in data['values']:
                return False
        
        return True

    def _clean_data_preserve_structure(self, data: Dict) -> Dict:
        """
        Limpia los datos MANTENIENDO exactamente la misma estructura original
        """
        # MANTENER estructura exacta del frontend
        cleaned_data = {
            'name': data['name'],
            'description': data['description'], 
            'columns': data['columns'].copy(),  # MANTENER nombres originales
            'types': data['types'].copy(),      # MANTENER tipos originales
            'values': {}
        }
        
        # Limpiar solo metadatos básicos (sin cambiar nombres de columnas)
        cleaned_data['name'] = self._clean_text_basic(data['name'])
        cleaned_data['description'] = self._clean_text_basic(data['description'])
        
        # Crear DataFrame con Polars para procesamiento eficiente
        values_dict = {}
        
        for i, column in enumerate(data['columns']):
            column_type = data['types'][i]
            raw_values = data['values'][column]
            
            # Limpiar cada columna según su tipo MANTENIENDO nombre original
            cleaned_values = self._clean_column_by_type(raw_values, column_type, column)
            
            # USAR EL NOMBRE ORIGINAL de la columna (NO cambiar nombres)
            values_dict[column] = cleaned_values
        
        # Crear DataFrame de Polars si es posible
        try:
            df = pl.DataFrame(values_dict)
            
            # Aplicar limpieza adicional con Polars
            df = self._apply_polars_cleaning(df, cleaned_data['types'])
            
            # Convertir de vuelta a diccionario MANTENIENDO nombres originales
            cleaned_data['values'] = df.to_dict(as_series=False)
            
        except Exception as e:
            logger.warning(f"Error con Polars, usando limpieza manual: {e}")
            cleaned_data['values'] = values_dict
        
        # LOG opcional del proceso de limpieza
        if getattr(settings, 'DATA_CLEANER_CONFIG', {}).get('LOG_CLEANING_OPERATIONS', False):
            report = self._generate_cleaning_report(data, cleaned_data)
            logger.info(f"Datos limpiados: {report}")
        
        return cleaned_data

    def _clean_text_basic(self, text: str) -> str:
        """
        Limpieza básica SOLO para metadatos (name, description)
        """
        if not text:
            return text
        
        text = str(text)
        text = self._fix_encoding_issues(text)
        text = unicodedata.normalize('NFKC', text)
        text = self.compiled_patterns['non_printable'].sub('', text)
        text = self.compiled_patterns['multiple_spaces'].sub(' ', text)
        
        return text.strip()

    def _clean_column_by_type(self, values: List, column_type: str, column_name: str) -> List:
        """
        Limpia una columna específica según su tipo de datos
        """
        cleaned_values = []
        
        for value in values:
            try:
                if value is None or value == '' or str(value).strip() == '':
                    cleaned_values.append(None)
                    continue
                
                if column_type == 'string':
                    cleaned_value = self._clean_text_value(value)
                elif column_type == 'number':
                    cleaned_value = self._clean_numeric_value(value)
                elif column_type == 'date' or 'fecha' in column_name.lower():
                    cleaned_value = self._clean_date_value(value)
                elif column_type == 'email':
                    cleaned_value = self._clean_email_value(value)
                elif column_type == 'phone':
                    cleaned_value = self._clean_phone_value(value)
                else:
                    # Tipo desconocido, limpiar como texto
                    cleaned_value = self._clean_text_value(value)
                
                cleaned_values.append(cleaned_value)
                
            except Exception as e:
                logger.warning(f"Error limpiando valor '{value}' en columna '{column_name}': {e}")
                cleaned_values.append(None)
        
        return cleaned_values

    def _clean_text_value(self, value: Any) -> str:
        """
        Limpieza ultra potente para valores de texto
        """
        if value is None:
            return None
        
        # Convertir a string
        text = str(value)
        
        # 1. Arreglar problemas de codificación UTF-8
        text = self._fix_encoding_issues(text)
        
        # 2. Normalizar caracteres Unicode
        text = unicodedata.normalize('NFKC', text)
        
        # 3. Remover caracteres no imprimibles
        text = self.compiled_patterns['non_printable'].sub('', text)
        
        # 4. Limpiar caracteres especiales problemáticos (mantener los básicos)
        text = self._clean_special_characters(text)
        
        # 5. Normalizar espacios
        text = self.compiled_patterns['multiple_spaces'].sub(' ', text)
        text = text.strip()
        
        # 6. Validar longitud
        if len(text) > 10000:  # Límite de seguridad
            text = text[:10000]
        
        return text if text else None

    def _clean_numeric_value(self, value: Any) -> Union[float, int, None]:
        """
        Limpieza para valores numéricos
        """
        if value is None:
            return None
        
        # Si ya es numérico, validar
        if isinstance(value, (int, float)):
            if str(value).lower() in ['inf', '-inf', 'nan']:
                return None
            return value
        
        # Convertir a string y limpiar
        text = str(value).strip()
        
        # Remover caracteres no numéricos excepto puntos, comas, signos
        text = re.sub(r'[^\d\-+.,]', '', text)
        
        # Manejar diferentes formatos de decimales
        if ',' in text and '.' in text:
            # Formato como 1,234.56
            text = text.replace(',', '')
        elif text.count('.') > 1:
            # Múltiples puntos, tomar el último como decimal
            parts = text.split('.')
            text = ''.join(parts[:-1]) + '.' + parts[-1]
        elif text.count(',') == 1 and '.' not in text:
            # Coma como separador decimal
            text = text.replace(',', '.')
        
        if not text or text in ['-', '+', '.', ',']:
            return None
        
        try:
            # Intentar conversión
            if '.' in text:
                result = float(text)
            else:
                result = int(text)
            
            # Validar resultado
            if str(result).lower() in ['inf', '-inf', 'nan']:
                return None
            
            return result
            
        except (ValueError, OverflowError):
            return None

    def _clean_date_value(self, value: Any) -> str:
        """
        Limpieza para valores de fecha
        """
        if value is None:
            return None
        
        text = str(value).strip()
        
        # Verificar si ya está en formato válido
        for pattern in self.compiled_patterns['date_patterns']:
            if pattern.match(text):
                try:
                    # Validar que la fecha sea real
                    if '-' in text:
                        parts = text.split('-')
                    else:
                        parts = text.split('/')
                    
                    if len(parts) == 3:
                        # Determinar formato y validar
                        if len(parts[0]) == 4:  # YYYY-MM-DD o YYYY/MM/DD
                            datetime(int(parts[0]), int(parts[1]), int(parts[2]))
                        else:  # DD-MM-YYYY o DD/MM/YYYY
                            datetime(int(parts[2]), int(parts[1]), int(parts[0]))
                        
                        return text
                except ValueError:
                    continue
        
        # Si no es válida, intentar limpiar
        text = re.sub(r'[^\d\-/]', '', text)
        
        # Intentar diferentes formatos
        date_formats = [
            '%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d',
            '%Y%m%d', '%d%m%Y'
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(text, fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        return None

    def _clean_email_value(self, value: Any) -> str:
        """
        Limpieza para valores de email
        """
        if value is None:
            return None
        
        text = str(value).strip().lower()
        
        # Remover espacios internos
        text = re.sub(r'\s', '', text)
        
        # Validar formato básico
        if self.compiled_patterns['email'].match(text):
            return text
        
        return None

    def _clean_phone_value(self, value: Any) -> str:
        """
        Limpieza para números telefónicos
        """
        if value is None:
            return None
        
        text = str(value).strip()
        
        # Extraer solo números y signos relevantes
        text = re.sub(r'[^\d\+\-\(\)\s]', '', text)
        
        # Remover espacios y paréntesis
        text = re.sub(r'[\s\(\)\-]', '', text)
        
        # Validar formato básico
        if self.compiled_patterns['phone'].match(text):
            return text
        
        return None

    def _fix_encoding_issues(self, text: str) -> str:
        """
        Arregla problemas comunes de codificación UTF-8
        """
        # Aplicar mapeo de caracteres mal codificados
        for bad_char, good_char in self.encoding_fixes.items():
            text = text.replace(bad_char, good_char)
        
        # Intentar diferentes decodificaciones si es necesario
        try:
            # Si el texto parece tener problemas de codificación
            if any(char in text for char in ['Ã', 'â€', 'Â']):
                # Intentar decodificar como latin1 y luego como utf8
                try:
                    text = text.encode('latin1').decode('utf-8')
                except:
                    pass
        except:
            pass
        
        return text

    def _clean_special_characters(self, text: str) -> str:
        """
        Limpia caracteres especiales manteniendo los útiles
        """
        # Mantener caracteres básicos y de puntuación comunes
        allowed_pattern = r'[a-zA-Z0-9\sÀ-ÿ\u0100-\u024F\u1E00-\u1EFF.,;:!?\'"()\[\]{}\-_@#$%&+=*/\\|<>~`^°©®™]'
        
        # Extraer solo caracteres permitidos
        cleaned_chars = re.findall(allowed_pattern, text)
        
        return ''.join(cleaned_chars)

    def _clean_column_name(self, column: str) -> str:
        """
        Limpia nombres de columnas
        """
        if not column:
            return "column_unnamed"
        
        # Limpiar texto básico
        clean_name = self._clean_text(column)
        
        # Convertir espacios a guiones bajos
        clean_name = re.sub(r'\s+', '_', clean_name)
        
        # Remover caracteres especiales excepto guiones bajos
        clean_name = re.sub(r'[^\w]', '', clean_name)
        
        # Asegurar que no esté vacío
        if not clean_name:
            return "column_unnamed"
        
        return clean_name

    def _clean_text(self, text: str) -> str:
        """
        Limpieza básica de texto
        """
        if not text:
            return ""
        
        text = str(text)
        text = self._fix_encoding_issues(text)
        text = unicodedata.normalize('NFKC', text)
        text = self.compiled_patterns['non_printable'].sub('', text)
        text = self.compiled_patterns['multiple_spaces'].sub(' ', text)
        
        return text.strip()

    def _apply_polars_cleaning(self, df: pl.DataFrame, types: List[str]) -> pl.DataFrame:
        """
        Aplica limpieza adicional usando funciones nativas de Polars
        MANTIENE los nombres de columnas originales
        """
        try:
            # Aplicar transformaciones específicas de Polars
            for column, dtype in zip(df.columns, types):
                if dtype == 'string':
                    # Limpieza adicional de strings con Polars
                    df = df.with_columns([
                        pl.col(column).str.strip_chars().alias(column)
                    ])
                elif dtype == 'number':
                    # Manejar valores infinitos o NaN
                    df = df.with_columns([
                        pl.when(pl.col(column).is_infinite() | pl.col(column).is_nan())
                        .then(None)
                        .otherwise(pl.col(column))
                        .alias(column)
                    ])
            
            return df
            
        except Exception as e:
            logger.warning(f"Error en limpieza con Polars: {e}")
            return df

    def _generate_cleaning_report(self, original_data: Dict, cleaned_data: Dict) -> Dict:
        """
        Genera un reporte de la limpieza realizada
        """
        report = {
            'total_columns': len(original_data.get('columns', [])),
            'total_rows': len(list(original_data.get('values', {}).values())[0]) if original_data.get('values') else 0,
            'columns_renamed': [],
            'values_cleaned': 0,
            'null_values_introduced': 0
        }
        
        # Contar cambios en nombres de columnas
        original_columns = original_data.get('columns', [])
        cleaned_columns = cleaned_data.get('columns', [])
        
        for orig, clean in zip(original_columns, cleaned_columns):
            if orig != clean:
                report['columns_renamed'].append({'from': orig, 'to': clean})
        
        # Contar valores limpiados y nulos introducidos
        if original_data.get('values') and cleaned_data.get('values'):
            for column in original_columns:
                if column in original_data['values']:
                    orig_values = original_data['values'][column]
                    # Encontrar la columna correspondiente en datos limpios
                    clean_column = None
                    for i, orig_col in enumerate(original_columns):
                        if orig_col == column:
                            clean_column = cleaned_columns[i]
                            break
                    
                    if clean_column and clean_column in cleaned_data['values']:
                        clean_values = cleaned_data['values'][clean_column]
                        
                        for orig_val, clean_val in zip(orig_values, clean_values):
                            if str(orig_val) != str(clean_val):
                                report['values_cleaned'] += 1
                            
                            if orig_val is not None and clean_val is None:
                                report['null_values_introduced'] += 1
        
        return report