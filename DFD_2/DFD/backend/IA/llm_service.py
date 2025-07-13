import json
import re
import os
from huggingface_hub import InferenceClient
from typing import Dict, Any, Optional
# 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
class LLMService:
    def __init__(self):
        self.client = InferenceClient(
            provider="featherless-ai",
            api_key=os.environ.get("HF_TOKEN"),
        )
        self.model = "mistralai/Magistral-Small-2506"
    
    def query(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.1) -> str:
        """Ejecuta consulta al modelo LLM"""
        messages = [
            {
                "role": "system",
                "content": "Eres un asistente experto en análisis de datos. Generas respuestas precisas y bien formateadas usando Markdown y LaTeX cuando sea apropiado."
            },
            {
                "role": "user",
                "content": prompt,
            }
        ]
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return completion.choices[0].message["content"]
        except Exception as e:
            print(f"Error en consulta LLM: {e}")
            return ""
    
    def clean_json_response(self, text: str) -> str:
        """Limpia la respuesta del LLM para extraer JSON válido"""
        text = text.strip()
        
        
        text = re.sub(r"```json|```", "", text)
        
        
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json_match.group(0)
        
        
        lines = text.split('\n')
        json_lines = []
        in_json = False
        
        for line in lines:
            if line.strip().startswith('{'):
                in_json = True
            if in_json:
                json_lines.append(line)
            if line.strip().endswith('}') and in_json:
                break
        
        if json_lines:
            return '\n'.join(json_lines)
        
        return '{}'
    
    def parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parsea la respuesta del LLM a un diccionario"""
        cleaned = self.clean_json_response(response)
        
        try:
            parsed = json.loads(cleaned)
            return parsed
        except json.JSONDecodeError as e:
            print(f"Error parseando JSON: {e}")
            print(f"Respuesta limpia: {cleaned}")
            return {"error": "Respuesta del modelo no es JSON válido"}
    
    def generate_data_explanation(self, question: str, results: list, context: str = "") -> str:
        """Genera explicación de los resultados usando Markdown y LaTeX"""
        
        
        math_keywords = ["promedio", "media", "suma", "total", "porcentaje", "ratio", "proporción"]
        needs_math = any(keyword in question.lower() for keyword in math_keywords)
        
        prompt = f"""
Eres un analista de datos experto. Explica estos resultados de manera clara y profesional.

DATOS OBTENIDOS:
{json.dumps(results, indent=2, ensure_ascii=False)}

PREGUNTA ORIGINAL: {question}

CONTEXTO ADICIONAL: {context}

INSTRUCCIONES DE FORMATO:
1. Usa Markdown para estructura y énfasis
2. Usa LaTeX (KaTeX) para fórmulas matemáticas cuando sea apropiado
3. Incluye insights y observaciones relevantes
4. Si hay números, considera mostrar cálculos con LaTeX
5. Usa tablas Markdown si es apropiado para organizar datos

EJEMPLOS DE FORMATO:
- Para promedios: "El promedio es $\\bar{{x}} = \\frac{{\\sum x_i}}{{n}} = {{valor}}$"
- Para porcentajes: "Representa el $\\frac{{valor}}{{total}} \\times 100\\% = {{porcentaje}}\\%$"
- Para comparaciones: "La diferencia es $\\Delta = |a - b| ={{diferencia}}$"

RESPUESTA:
"""
        
        return self.query(prompt, max_tokens=1024, temperature=0.3)
    
    def validate_and_enhance_query(self, parsed_query: Dict[str, Any]) -> Dict[str, Any]:
        """Valida y mejora la consulta parseada"""
        
        # Validaciones básicas
        if not parsed_query.get("collection"):
            return {"error": "No se especificó una tabla (collection)"}
        
        # Asegurar que filters es una lista
        if "filters" not in parsed_query:
            parsed_query["filters"] = []
        elif not isinstance(parsed_query["filters"], list):
            parsed_query["filters"] = []
        
        # Asegurar que fields es una lista
        if "fields" not in parsed_query:
            parsed_query["fields"] = []
        elif not isinstance(parsed_query["fields"], list):
            parsed_query["fields"] = []
        
        # Validar agregaciones
        if "aggregations" in parsed_query:
            agg = parsed_query["aggregations"]
            if "sort" in agg:
                sort_config = agg["sort"]
                if not isinstance(sort_config, dict) or "field" not in sort_config:
                    del agg["sort"]
                else:
                    # Asegurar que order es válido
                    if "order" not in sort_config:
                        sort_config["order"] = "asc"
                    elif sort_config["order"] not in ["asc", "desc"]:
                        sort_config["order"] = "asc"
            
            if "limit" in agg:
                try:
                    agg["limit"] = int(agg["limit"])
                    if agg["limit"] <= 0:
                        agg["limit"] = 1
                except (ValueError, TypeError):
                    agg["limit"] = 20
        
        
        if not parsed_query.get("response_text"):
            parsed_query["response_text"] = "Consulta ejecutada exitosamente"
        
        return parsed_query


llm_service = LLMService()