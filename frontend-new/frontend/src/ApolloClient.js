import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://neo4j:4000/graphql", // ✅ Connects to Neo4j inside Docker
  cache: new InMemoryCache(),
});

export default client;
