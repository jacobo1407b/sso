# syntax = docker/dockerfile:1

# Ajusta la versión de Node según lo que necesites
ARG NODE_VERSION=24.7.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Directorio de trabajo
WORKDIR /app

# Variables de entorno (secrets y configuración)
ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://neondb_owner:npg_nM5FqHN8IvdV@ep-soft-cherry-a616chu6-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require"
ENV SECRET_KEY="949f04e1f9ba1fe282ee109fd14a9a83"
ENV CLOUDINARY_CLOUD_NAME="dn30ekshs"
ENV CLOUDINARY_API_KEY="862614298284656"
ENV CLOUDINARY_API_SECRET="3Dgvj0mWYDxsksvckmbNfSzkLBs"
ENV URL_MAIN="http://localhost:5000"
ENV SECRET_SPEAKEASY="ITGLOBAL"
ENV ISSUER_SPEAKEASY="ITGLOBAL"

# Etapa de build
FROM base as build

# Instala dependencias necesarias para compilar módulos nativos
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Copia archivos de dependencias
COPY --link package.json yarn.lock ./

# Instala dependencias con Yarn
RUN yarn install --frozen-lockfile

# Copia el resto del código
COPY --link . .

# Compila la aplicación
RUN yarn build

# Etapa final
FROM base

# Copia la app ya construida
COPY --from=build /app /app

# Expone el puerto
EXPOSE 3000

# Comando de inicio
CMD ["yarn", "start"]