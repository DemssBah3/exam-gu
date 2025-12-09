# exam-gu-frontend/Dockerfile

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installer serve pour servir l'app statique
RUN npm install -g serve

# Copier le build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
