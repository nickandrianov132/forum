FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run generate

EXPOSE 7000

CMD ["node", "ts-node", "index.ts"]