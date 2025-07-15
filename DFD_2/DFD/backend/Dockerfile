FROM python:3.11-slim-bookworm

# Instala solo lo necesario
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        build-essential gcc libpq-dev python3-dev libffi-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "DataforDummies.asgi:application"]

