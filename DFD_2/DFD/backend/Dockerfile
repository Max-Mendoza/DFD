FROM python:3.11-slim-bookworm

# Instalar dependencias necesarias para compilar y correr paquetes (incluye build-essential para gcc y make)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        python3-dev \
        libpq-dev \
        libffi-dev \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "DataforDummies.asgi:application"]

