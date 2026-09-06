🌐 Fullstack Forum App
Современная платформа для общения, построенная на базе GraphQL и TypeScript. Проект демонстрирует реализацию сквозной типизации (End-to-End Type Safety) от базы данных до фронтенда.

**Frontend**
    React (с использованием Hooks и Modern Patterns)
    Apollo Client (управление состоянием и запросами GraphQL)
    Redux Toolkit (глобальное состояние UI)
    React Router v6 (навигация)

**Backend**
    Node.js & Apollo Server (GraphQL API)
    MongoDB & Mongoose (База данных и моделирование)
    TypeScript (строгая типизация всей логики)

**Инструменты**
    GraphQL Codegen — автоматическая генерация типов и React-хуков на основе GraphQL схем.
    Vit - сборщик

**🛠 Особенности проекта**
- Type Safety: Полная синхронизация типов между бэкендом и фронтендом.
- GraphQL API: Гибкая система запросов без избыточности данных (overfetching).
- Normalized Cache: Эффективное кэширование на клиенте с помощью Apollo.
- Scalable Architecture: Четкое разделение на клиентскую и серверную части.

**Как запустить проект**
1. Клонирование репозитория:
git clone https://github.com/nickandrianov132/forum.git
cd graphql-ts-app

2. Настройка Backend:
cd server
npm install
# в файле .env указываем свой MONGODB_URI
npm run dev

3. Настройка Frontend:
cd client
npm install
npm run dev

4. Генерация типов (Codegen):
cd server - кодген конфиг codegen.ts находится в папке server 
npm run generate


📑 Структура проекта
/client: React приложение, Apollo операции, UI компоненты.
/server: Apollo Server, схемы GraphQL, резолверы и модели Mongoose.

📈 Планы по улучшению (Roadmap)
- Система комментариев: Реализация базовых веток обсуждений.
- Вложенные комментарии: Глубокая вложенность (ответы на ответы) для полноценных дискуссий.
- Cursor-based pagination: Оптимизация загрузки ленты постов для высокой производительности.
- Dark Mode: Переключение тем оформления с сохранением состояния через Redux Toolkit.

