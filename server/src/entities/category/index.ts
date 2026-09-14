import resolvers from "./resolvers.ts";
// import typeDefs from "./type-defs.graphql";
import { loadTypedefsSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
const sources = loadTypedefsSync('./src/**/*.graphql', {
  loaders: [new GraphQLFileLoader()]
});
const typeDefs = sources.map(s => s.document);
export { resolvers, typeDefs };