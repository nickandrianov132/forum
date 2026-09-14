import "graphql-import-node";
import { makeExecutableSchema } from "@graphql-tools/schema";

import {
    resolvers as userResolvers,
    typeDefs as userTypeDefs,
} from "./entities/user/index.ts";
import {
    resolvers as postResolvers,
    typeDefs as postTypeDefs,
} from "./entities/post/index.ts";
import {
    resolvers as likeResolvers,
    typeDefs as likeTypeDefs,
} from "./entities/like/index.ts";
import {
    resolvers as dislikeResolvers,
    typeDefs as dislikeTypeDefs,
} from "./entities/dislike/index.ts";
import {
    resolvers as categoryResolvers,
    typeDefs as categoryTypeDefs,
} from "./entities/category/index.ts";


const schema = makeExecutableSchema({
    typeDefs: [userTypeDefs, postTypeDefs, likeTypeDefs, dislikeTypeDefs, categoryTypeDefs],
    resolvers: [userResolvers, postResolvers, likeResolvers, dislikeResolvers, categoryResolvers],
});

export default schema;