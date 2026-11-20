import "graphql-import-node";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLDateTime } from "graphql-scalars";

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
import {
    resolvers as messageResolvers,
    typeDefs as messageTypeDefs,
} from "./entities/message/index.ts";
import {
    resolvers as commentResolver,
    typeDefs as commentTypeDefs,
} from "./entities/comment/index.ts";
import {
    resolvers as commentLikeResolver,
    typeDefs as commentLikeTypeDefs,
} from "./entities/commentLike/index.ts";
import {
    resolvers as commentDislikeResolver,
    typeDefs as commentDislikeTypeDefs,
} from "./entities/commentDislike/index.ts";


const schema = makeExecutableSchema({
    typeDefs: [userTypeDefs, postTypeDefs, likeTypeDefs, dislikeTypeDefs, categoryTypeDefs, messageTypeDefs, commentTypeDefs, commentLikeTypeDefs, commentDislikeTypeDefs],
    resolvers: [ { DateTime: GraphQLDateTime}, userResolvers, postResolvers, likeResolvers, dislikeResolvers, categoryResolvers, messageResolvers, commentResolver, commentLikeResolver, commentDislikeResolver],
});

export default schema;