import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./typeDefs.js"; // Note .js extension for imports in this project
import { resolvers } from "./resolvers.js";
export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});
