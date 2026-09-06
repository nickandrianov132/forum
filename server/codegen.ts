import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./src/**/*.graphql",
    documents: ["../client/src/graphql/**/*.{ts,tsx}", ], 
    generates: {
        "./src/types/resolvers-types.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                // useIndexSignature: true,
                // defaultMapper: "Partial<{T}>",
                //  contextType: "./src/types/context#MyContext",
                contextType: "../../index.js#MyContext",
                 mappers:{
                     User: "../models/Users.js#IUser",
                     Post: "../models/Posts.js#IPost",
                     Like: "../models/Likes.js#ILike",
                     Dislike: "../models/Dislikes.js#IDislike"
                 },
                 useIndexSignature: true, 
                 scalars: {
                    ID: 'string',
                 },
                 useTypeImports: true, // <--- Добавьте эту строку
                 // Эта опция помогает правильно обрабатывать расширения в ESM
                emitLegacyCommonJSImports: false 
            }
        },
        "../client/src/gql/": {
                    preset: "client",
                    plugins: [],
                    config: {
                        scalars: { ID: 'string' },
                        useTypeImports: true,
                        emitLegacyCommonJSImports: false
                    }
        },
    },
}

export default config;