const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
require("dotenv").config();

// Connect to Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://neo4j:7687",
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Define GraphQL Schema
const typeDefs = `
    type Query {
        transactions: [Transaction!]!
        addresses: [Address!]!
    }

    type Address @node {
        id: ID!
        transactions: [Transaction!]! @relationship(type: "SENT", direction: OUT)
    }

    type Transaction @node {
        amount: Float
        receiver: [Address!]! @relationship(type: "SENT", direction: IN)
        sender: [Address!]! @relationship(type: "SENT", direction: OUT)
    }
`;

(async () => {
  try {
    console.log("⏳ Initializing Neo4jGraphQL schema...");
    const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

    // Ensure the schema is built properly
    const schema = await neoSchema.getSchema();

    console.log("✅ Schema successfully created. Starting Apollo Server...");

    const server = new ApolloServer({ schema });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });

    console.log(`🚀 GraphQL API ready at ${url}`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    if (Array.isArray(error)) {
      console.error(
        "Detailed errors:",
        error.map((err) => err.message)
      );
    }
    process.exit(1); // Exit the process with an error code
  }
})();
