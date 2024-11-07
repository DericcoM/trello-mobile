# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Создаём директорию /usr/share/nginx/html/
RUN mkdir -p /usr/share/nginx/html/

# Копируем содержимое сборки в /usr/share/nginx/html/
COPY --from=builder /app/build/ /usr/share/nginx/html/

# Копируем обновлённый конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
