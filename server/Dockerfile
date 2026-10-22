FROM node:20-alpine

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

# Запускаем сервер напрямую через tsx
CMD ["tsx", "index.ts"]
