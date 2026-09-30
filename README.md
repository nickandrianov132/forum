# Full-Stack GraphQL Forum Application 💬

A scalable, production-ready forum engine built inside a fully-typed **TypeScript** monorepo ecosystem. This project architecture leverages **GraphQL** for flexible data fetching, **Node.js/Express** with **Apollo Server** for robust backend business logic, and a reactive **React** client powered by **Apollo Client** and **Redux Toolkit**.

---

## 🛠️ Tech Stack & Domain Architecture

- **Backend:** Node.js, TypeScript (ESM), Apollo Server, Express
- **Frontend:** React, TypeScript, Apollo Client, Redux Toolkit (RTK), Tailwind CSS
- **Database & Cloud:** MongoDB, Mongoose ODM, Supabase Storage (Cloud Media Assets)
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

### 5. Declarative Access Control (Higher-Order Resolver Guards)
- Designed an elegant functional **Auth Guard** abstraction (`authenticated`) using JavaScript Higher-Order Functions (HOF).
- Protects private mutations/queries declaratively (`user: authenticated(async (_, {id}) => ...)`) eliminating repetitive validation code.
- Emits fully-compliant enterprise `GraphQLError` payloads populated with structural extensions (`UNAUTHENTICATED`, HTTP Status 401).

### 6. Cascade Data Deletions & Referential Integrity
- Because NoSQL MongoDB environments lack native foreign key cascades (`ON DELETE CASCADE`), database consistency logic was securely engineered directly into the resolver tier.
- Execution blocks within high-impact mutations like `deleteUser` invoke atomic multi-collection triggers (`PostModel.deleteMany`, `LikeModel.deleteMany`) ensuring zero orphaned relational nodes remain.

### 7. Core Rich-Text UI Engineering (Meta's Lexical Editor Plugin)
- Developed a highly customized textual formatting layer leveraging **Meta’s Lexical Editor API**.
- Implemented a production-grade `ToolbarPlugin` that interacts directly with Lexical's internal immutable tree structures (`registerUpdateListener`) and state selection schemas (`$getSelection`, `$isRangeSelection`).
- Realized fine-grained inline node patching (`$patchStyleText`) for custom font-families and robust typography block transformation (`$setBlocksType` using `$createHeadingNode`) for rich user composition.

---

## 📂 Project Structure Overview

The project is structured with a modular, **Domain-Driven Directory Layout** ensuring distinct feature encapsulation and seamless codebase scalability:

```text
server/
├── src/
│   ├── entities/          # Modularized Domain Feature Folders
│   │   ├── user/          # Isolated schemas & logical boundaries
│   │   │   ├── index.ts
│   │   │   ├── resolvers.ts
│   │   │   └── type-defs.graphql
│   │   ├── post/
│   │   ├── like/
│   │   └── category/
│   ├── loaders/           # DataLoaders optimization layer (N+1 fix)
│   ├── models/            # Mongoose ODM Schemas and Models
│   ├── types/             # Auto-generated Types (GraphQL Codegen)
│   ├── utils/             # HOF Auth Guards and Helpers
│   ├── config.ts          # Strongly-typed environment variables
│   └── schemat.ts         # Central makeExecutableSchema aggregator
└── index.ts               # Express/Apollo Server configuration & WS server hooks
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally or via MongoDB Atlas

### Installation & Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com
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
