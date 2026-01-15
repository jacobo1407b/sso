# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo los archivos de dependencias para aprovechar el caché de capas
COPY package.json yarn.lock ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN yarn install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Ejecutar el build (esto genera la carpeta /dist o /build)
RUN yarn build


# Etapa 2: Ejecución (Runner)
FROM node:20-alpine AS runner

WORKDIR /app

# Establecer entorno de producción
ENV NODE_ENV=production

# Copiar solo los archivos necesarios de la etapa anterior
# 1. Copiamos el build generado
COPY --from=builder /app/dist ./dist
# 2. Copiamos los archivos de dependencias
COPY --from=builder /app/package.json /app/yarn.lock ./

# Instalar solo dependencias de producción para mantener la imagen ligera
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Exponer el puerto que usa tu app (ejemplo: 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["yarn", "start"]
