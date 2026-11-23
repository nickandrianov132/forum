FROM node:20-alpine

# Устанавливаем Redis внутри образа
RUN apk add --no-cache redis

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости вашего сервера
RUN npm install

# Глобально устанавливаем утилиту 'tsx' для идеального запуска TS/ESM кода
RUN npm install -g tsx

# Копируем весь исходный код бэкенда
COPY . .

# Открываем порт
EXPOSE 7000

# Запускаем Redis в фоне и сразу стартуем сервер
CMD ["sh", "-c", "redis-server --daemonize yes && tsx index.ts"]
