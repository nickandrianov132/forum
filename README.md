# Full-Stack GraphQL Forum Application 💬

A scalable, production-ready forum engine built inside a fully-typed **TypeScript** monorepo ecosystem. This project architecture leverages **GraphQL** for flexible data fetching, **Node.js/Express** with **Apollo Server** for robust backend business logic, and a reactive **React** client powered by **Apollo Client** and **Redux Toolkit**.

---

## 🛠️ Tech Stack & Domain Architecture

- **Backend:** Node.js, TypeScript (ESM), Apollo Server, Express
- **Frontend:** React, TypeScript, Apollo Client, Redux Toolkit (RTK), Tailwind CSS
- **Database & Cloud:** MongoDB, Mongoose ODM, Redis (Presence & TTL Caching), Supabase Storage (Cloud Media Assets)
- **Rich-Text Engine:** Meta's Lexical Editor API
- **Type Safety Pipeline:** GraphQL Code Generator (Codegen)

---

## 🔥 Key Engineering Solutions & Advanced Architecture

### 1. Database Optimization & Resolving the N+1 Problem (DataLoaders)
- **The Challenge:** Fetching relational-like structures (Users ➔ Posts ➔ Likes/Dislikes) in a document-based NoSQL database like MongoDB typically introduces severe N+1 query overhead.
- **The Solution:** Integrated **DataLoaders** (`createLoaders`) directly into the GraphQL Server Context layer. Incoming granular document queries are automatically batched and cached into minimal single database operations, drastically reducing database IOPS and enhancing API throughput.

### 2. Full-Stack End-to-End Type Safety (GraphQL Codegen)
- Configured a highly automated **GraphQL Code Generator** pipeline optimized for ECMAScript Modules (ESM).
- Implemented strict custom **Mappers** bridging core GraphQL Schema definitions with explicit Mongoose database models (`IUser`, `IPost`, `ICategory`, `ILike`).
- Generates precise compiler signatures (`Resolvers<MyContext>`) on the server and synchronized typed hooks (`preset: "client"`) on the frontend, enforcing 100% build-time contract alignment across the application.

### 3. Atomic Client-Side Token Refresh Queue (`ApolloLink` & Observables)
- **Seamless Session Recovery:** Developed a sophisticated custom `ApolloLink` middleware on the client app to gracefully intercept network exceptions or `UNAUTHENTICATED` (401) responses.
- **Request Enqueuing:** Built an asynchronous queue tracking state array (`pendingRequests`) powered by `RxJS Observables`. When an access token expires, outgoing requests are seamlessly frozen in place while an automated background mutation rotates the session using a long-lived `refreshToken` (15d). Once successfully renewed, the entire queue is automatically flushed and retried with new authorization headers without interrupting the user lifecycle.

### 4. Hybrid Networking & Stateful GraphQL Subscriptions (WebSockets)
- Engineered a unified network splitter layer (`ApolloLink.split`) separating standard unary HTTP traffic (Queries/Mutations) from real-time events via **WebSockets (`graphql-ws`)**.
- **Protocol Guarding:** Implemented a secure authentication firewall within the WebSocket server's `onConnect` hook. If a socket handshake attempts connection with an expired or missing token, the connection is instantly rejected at the network protocol layer before system resources are allocated.

### 5. Hybrid Real-Time Presence System (WebSockets + Redis TTL + Throttled Heartbeat)
- **The Challenge:** Relying solely on WebSocket disconnection events (`onDisconnect`) often produces "zombie" online sessions—especially inside mobile WebViews (e.g., Telegram in-app browser) or when network connections drop abruptly without sending a close frame. Conversely, naive activity listeners (`click`, `keypress`, `focus`) can easily flood the backend with redundant network requests.
- **Instant Socket Lifecycle (`WeakMap` + Redis):** Native `graphql-ws` socket instances are mapped to active user sessions via a `WeakMap` (`socketSessionMap`). On `onConnect`, an ephemeral key (`user:${userId}:status`) is stored in **Redis** with a 45-second **TTL**, and a `USER_STATUS` subscription event is broadcast. On a clean tab close (`onDisconnect`), the Redis key is immediately purged, MongoDB (`isOnline: false`, `lastSeen`) is updated, and an instant offline payload is pushed to all connected clients.
- **Self-Healing Heartbeat (`pingOnline` & TTL Recovery):** To handle zombie sessions and backgrounded mobile WebViews, the client executes a `pingOnline` GraphQL mutation that refreshes the 45-second Redis TTL. If the remaining TTL drops to `<= 5s` or expires (e.g., due to server sleep/cold start), the resolver automatically resurrects the user's online state in MongoDB and re-broadcasts the `USER_STATUS` subscription.
- **Client-Side Throttling (`useRef`):** On the frontend (`App.tsx`), user activity events (`focus`, `click`, `keypress`) and a 20-second background interval are wrapped in a custom timestamp-based throttle utilizing `useRef` (`lastPingTimeRef`). An immediate forced ping fires on initial mount, while subsequent activity triggers are strictly rate-limited to at most once every 20 seconds without causing extra React re-renders.


### 6. Declarative Access Control (Higher-Order Resolver Guards)
- Designed an elegant functional **Auth Guard** abstraction (`authenticated`) using JavaScript Higher-Order Functions (HOF).
- Protects private mutations/queries declaratively (`user: authenticated(async (_, {id}) => ...)`) eliminating repetitive validation code.
- Emits fully-compliant enterprise `GraphQLError` payloads populated with structural extensions (`UNAUTHENTICATED`, HTTP Status 401).

### 7. Cascade Data Deletions & Referential Integrity
- Because NoSQL MongoDB environments lack native foreign key cascades (`ON DELETE CASCADE`), database consistency logic was securely engineered directly into the resolver tier.
- Execution blocks within high-impact mutations like `deleteUser` invoke atomic multi-collection triggers (`PostModel.deleteMany`, `LikeModel.deleteMany`) ensuring zero orphaned relational nodes remain.

### 8. Custom Rich-Text Editor & AST Node Engineering (Meta's Lexical + Supabase)
- **Custom Toolbar & Block Transformations:** Built a customized rich-text composition engine on top of **Meta’s Lexical Editor API**. Implemented a `ToolbarPlugin` interacting directly with Lexical's immutable editor state (`registerUpdateListener`), selection APIs (`$getSelection`, `$isRangeSelection`), inline text styling (`$patchStyleText`), and block-level node transformations (`$setBlocksType` with `$createHeadingNode`).
- **Custom `ImageNode` (`DecoratorNode`) & Full Serialization Pipeline:** Engineered a custom `ImageNode` extending Lexical's `DecoratorNode<React.JSX.Element>`. Implemented `decorate()` for reactive in-editor rendering, alongside `exportJSON()`, `importJSON()`, and `exportDOM()` methods to seamlessly serialize editor AST states into JSON for MongoDB persistence and convert them back into clean, lazy-loaded HTML (`LexicalHTMLRenderer`).
- **Smart AST Insertion (`ImagePlugin` & `INSERT_IMAGE_COMMAND`):** Created a dedicated `ImagePlugin` listening to a custom `INSERT_IMAGE_COMMAND` (`COMMAND_PRIORITY_EDITOR`). After uploading media to **Supabase Storage**, the plugin traverses the selection's parent hierarchy up to the top-level `root` block, inserts the `ImageNode` cleanly between paragraphs (preventing invalid nested DOM structures), appends a fresh `ParagraphNode`, and automatically moves the user's cursor focus (`nextParagraph.select()`) for uninterrupted typing.


---

## 📂 Project Structure Overview

The project is organized as a modular monorepo separating the GraphQL backend and the reactive React frontend:

```text
forum/
├── client/                         # React + TypeScript Frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── header/             # Auth forms, user profile & navigation
│       │   ├── leftNavbar/         # Dynamic category sidebar
│       │   ├── lexical/            # Meta Lexical Editor (Editor, ToolbarPlugin, ImageNode, ImagePlugin, LexicalHTMLRenderer)
│       │   ├── popups/             # Modal dialogs & notifications
│       │   ├── rightSidebar/       # Real-time online chat & active users list
│       │   └── userPanel/          # Avatar upload & user controls
│       ├── gql/                    # Auto-generated GraphQL Codegen client hooks
│       ├── graphql/                # Queries, Mutations, Subscriptions & Apollo Links
│       ├── pages/                  # Route views (Posts, PostDetail, AdminPanel, Registration)
│       ├── store/                  # Redux Toolkit store & auth slices
│       ├── supabase/               # Supabase Storage client & media upload service
│       └── utils/                  # Zod validation schemas, route configs & helpers
│
└── server/                         # Node.js + Apollo Server Backend (ESM)
    ├── src/
    │   ├── entities/               # Domain-Driven GraphQL Modules
    │   │   ├── category/           # type-defs.graphql, resolvers.ts, index.ts
    │   │   ├── like/
    │   │   ├── message/            # Live chat resolvers & subscriptions
    │   │   ├── post/
    │   │   └── user/               # Auth, profile, ban system & pingOnline mutation
    │   ├── loaders/                # DataLoaders (mainLoader.ts) for N+1 batching
    │   ├── models/                 # Mongoose ODM Schemas (Users, Posts, Comments, Messages, Likes, Category)
    │   ├── types/                  # Auto-generated GraphQL Codegen server types
    │   ├── utils/                  # Redis client (redis.ts), PubSub (userPubSub.ts), JWT & HOF Auth Guards
    │   ├── config.ts               # Typed environment variables
    │   └── schema.ts               # Central makeExecutableSchema aggregator
    ├── Dockerfile                  # Containerization setup for backend deployment
    └── index.ts                    # Express, Apollo Server & graphql-ws lifecycle hooks
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally or via MongoDB Atlas

### Installation & Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nickandrianov132/forum.git
   cd forum
   ```

2. **Install monorepo dependencies:**
   ```bash
   npm install
   ```


 3. **Configure the Environment:**
    Create a `.env` file in the root of your backend directory and add the following variables:

    ```env
    # Application Environment
    NODE_ENV=development
    PORT=7000

    # Database Configuration
    MONGO_URI=mongodb://127.0.0.1:27017/graphql-ts-app
    REDIS_URL=redis://localhost:6379

    # Security & JWT Tokens (Must be at least 10 characters long)
    JWT_SECRET_KEY=your_super_secret_access_key_here
    JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
    ```

4. **Compile Contract Definitions (Codegen):**
   Execute the automated type-generator pipeline before boot:
   ```bash
   npm run generate
   ```

5. **Start Dev Servers:**
   ```bash
   npm run dev
   ```

---
