import json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from .mongo_service import build_filter_mongo, build_prompt_with_context, validate_query, execute_query, get_tables, get_columns, debug_database_content
from pymongo import MongoClient
from django.conf import settings
from rest_framework import permissions
import re
import os

import os
api_key = os.getenv('OPENROUTER_API_KEY')    
    
def huggingface_query(prompt):
    messages = [
        {
            "role": "user",
            "content": prompt,
        }
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://data-for-dummies-nine.vercel.app",
        "X-Title": "DataForDummies Assistant"
    }

    data = {
        "model": "moonshotai/kimi-k2:free",  # Puedes usar claude-3-haiku, llama3:8b-instruct, etc.
        "messages": messages
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )

        if response.status_code != 200:
            print("⚠️ Error en respuesta:", response.status_code, response.text)
            return "Lo siento, hubo un problema al contactar con la IA."

        result = response.json()
        print("DEBUG response:", result)

        return result["choices"][0]["message"]["content"]

    except Exception as e:
        print("❌ Error llamando a OpenRouter:", str(e))
        return "Lo siento, ocurrió un error inesperado al procesar tu solicitud."
        
def clean_llm_response(text):
    # Elimina los json y busca contenido JSON entre llaves
    text = text.strip()
    text = re.sub(r"json|```", "", text)
    match = re.search(r'\{.*\}', text, re.DOTALL)
    return match.group(0) if match else '{}'

def build_chart_prompt(question, data):
    return f"""
        Eres un asistente experto en visualización de datos.

        Basado en los siguientes datos reales:

        {data}

        Y en esta solicitud del usuario:
        \"{question}\"

        Genera un JSON válido que represente un gráfico compatible con la librería [Apache ECharts](https://echarts.apache.org/).  
        Utiliza esta estructura como referencia:

        {{
        "title": {{"Título del gráfico"}},
        "xAxis": {{
            "type": "category",
            "data": ["categoría1", "categoría2", ...]
        }},
        "yAxis": {{
            "type": "value"
        }},
        "series": [
            {{
            "type": "bar" | "line" | "pie",
            "data": [valor1, valor2, ...]
            }}
        ]
        }}

        Reglas importantes:
        - Usa `"bar"` como tipo de gráfico por defecto, a menos que el usuario pida uno diferente.
        - Asegúrate de que los arrays de `xAxis.data` y `series[0].data` tengan el mismo número de elementos.
        - El JSON debe ser válido y sin explicaciones ni texto adicional.
        - No incluyas comentarios ni encabezados Markdown.
        -Solo envia el json, no mas

        Lo unico y exclusivo que tienes que responder es con el json, no respondas con nada mas aparte del json 
        """



class QueryMongoIA(APIView):
    permission_classes = [permissions.AllowAny]  # <--- permitir sin auth luego quitalo perro
    def post(self, request):
        question = request.data.get("question")
        project_id = request.data.get("project_id")
        user_id = request.user.id
        debug_database_content(user_id, project_id)
        if not question or not project_id:
            return Response({"error": "Missing 'pregunta' or 'proyecto'"}, status=400)
        prompt = build_prompt_with_context(question, user_id, project_id)
        llm_response = huggingface_query(prompt)
        cleaned = clean_llm_response(llm_response)
        try:
            parsed = json.loads(cleaned)
        except Exception:
            return Response({"error": "The LLM response is not valid JSON."}, status=400)
        collection = parsed.get("collection")
        filters = parsed.get("filters", [])
        fields = parsed.get("fields", [])
        friendly_text = parsed.get("response_text", "")
        if not collection:
            return Response({"error": "No collection specified by the model."}, status=400)
        valid_collection = validate_query(user_id, project_id, collection)
        if not valid_collection:
            return Response({"error": "Unauthorized or unknown collection."}, status=403)
        print(collection)
        print(filters)
        print(fields)
        results = execute_query(collection, filters, fields)
        response_prompt = f"""
            Eres un asistente que explica resultados de datos. Basado en estos datos:
            {results}
            Para el siguiente caso, el usuario debe ser explicito y debe estar en su pregunta la palabra "tabla"
            En caso de que el usuario te pida presentar información en forma de tabla y solo unica y exclusivamente si te lo pide, por favor genera la tabla usando formato Markdown, no LaTeX.
            Usa el siguiente formato para las tablas:

            | Columna1 | Columna2 | Columna3 |
            |----------|----------|----------|
            | Dato1    | Dato2    | Dato3    |
            
            Esto asegurará que las tablas se muestren correctamente en el chat, manteniendo claridad y legibilidad Y no devuelvas nada, mas que la tabla.
            Responde de forma clara y natural a la pregunta:
            {question}
            """
        final_response = huggingface_query(response_prompt)
        print ("Estos son los resultados:", results)
        print ("Estos es la respuesta final:", results)
        
        return Response({
            "results": results,
            "final_response": final_response
        })
        
class GenerateChart(APIView):
    def post (self, request):
        question = request.data.get("question")
        project_id = request.data.get("project_id")
        user_id = str(request.user.id)
   
        if not question or not project_id:
            return Response({"error": "Missing 'pregunta' or 'proyecto'"}, status=400)
        prompt = build_prompt_with_context(question, user_id, project_id)
        llm_response = huggingface_query(prompt)
        cleaned = clean_llm_response(llm_response)
        try:
            parsed = json.loads(cleaned)
        except Exception:
            return Response({"error": "The LLM response is not valid JSON."}, status=400)
        collection = parsed.get("collection")
        filters = parsed.get("filters", [])
        fields = parsed.get("fields", [])
        friendly_text = parsed.get("response_text", "")
        if not collection:
            return Response({"error": "No collection specified by the model."}, status=400)
        valid_collection = validate_query(user_id, project_id, collection)
        if not valid_collection:
            return Response({"error": "Unauthorized or unknown collection."}, status=403)
        print(collection)
        print(filters)
        print(fields)
        results = execute_query(collection, filters, fields)
        response_prompt = build_chart_prompt(question=question, data=results)
        final_response = huggingface_query(response_prompt)
        cleaned_json = json.loads(clean_llm_response(final_response))

        print (results)
        print(friendly_text)
        return Response({
            "response_text": friendly_text,
            "results": results,
            "final_response": cleaned_json
        })
