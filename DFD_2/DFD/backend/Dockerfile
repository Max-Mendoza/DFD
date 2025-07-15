FROM python:3.11-slim-bookworm

# Instalar dependencias del sistema necesarias para compilar algunas librerías
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential gcc python3-dev libpq-dev libffi-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia solo requirements.txt para aprovechar la cache de Docker
COPY requirements.txt .

# Actualiza pip y instala dependencias
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la app
COPY . .

# Expone el puerto 8000 para Daphne
EXPOSE 8000

# Comando para iniciar Daphne con ASGI
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "DataforDummies.asgi:application"]

