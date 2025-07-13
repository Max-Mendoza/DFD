# Usamos una versión específica de Node.js para React
FROM node:20-alpine

# Ponemos el código de tu app React dentro de "/app" en Docker
WORKDIR /app

# Copiamos tus archivos de dependencias y las instalamos
COPY package.json ./
COPY package-lock.json ./ 
RUN npm install

# Copiamos todo el resto de tu código de frontend
COPY . .

# Le decimos a Docker que tu app React usará el puerto 3000
EXPOSE 3000

# Este comando inicia tu servidor de desarrollo React
CMD ["npm", "run", "dev", "--", "--host"]

ENV DJANGO_SETTINGS_MODULE=DFD.settings

