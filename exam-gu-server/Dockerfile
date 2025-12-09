# exam-gu-server/Dockerfile

FROM node:18-alpine

WORKDIR /app

# ✅ Installer OpenSSL (critque pour Prisma)
RUN apk add --no-cache openssl

# Copier les fichiers
COPY package*.json ./
COPY prisma ./prisma/

# Installer dépendances
RUN npm ci

# Générer Prisma Client
RUN npx prisma generate

# Copier le reste
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
