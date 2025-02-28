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
        transactions(where: TransactionWhere): [Transaction!]!
        addresses(where: AddressWhere): [Address!]!
    }

    type Address @node {
        id: ID!
        transactions: [Transaction!]! @relationship(type: "SENT", direction: OUT)
    }

    type Transaction @node {
        amount: Float
        receiver: Address @relationship(type: "SENT", direction: IN)
        sender: Address @relationship(type: "SENT", direction: OUT)
    }
`;

(async () => {
  try {
    console.log("⏳ Initializing Neo4jGraphQL schema...");

    const resolvers = {
      Query: {
        addresses: async (_source, _args, context) => {
          if (!context.driver) {
            console.error("❌ ERROR: Neo4j Driver is missing in context!");
            throw new Error("Neo4j Driver not available.");
          }

          const session = context.driver.session();
          try {
            console.log("🔍 Fetching Addresses...");
            const result = await session.run(
              "MATCH (a:Address) RETURN a.id AS id LIMIT 10"
            );
            return result.records.map((record) => ({
              id: record.get("id"),
            }));
          } finally {
            await session.close();
          }
        },

        transactions: async (_source, _args, context) => {
          const session = context.driver.session();
          try {
            console.log("🔍 Fetching Transactions...");
            const result = await session.run(
              "MATCH (t:Transaction) RETURN t.amount AS amount LIMIT 10"
            );
            return result.records.map((record) => ({
              amount: record.get("amount"),
            }));
          } finally {
            await session.close();
          }
        },
      },
    };

    const neoSchema = new Neo4jGraphQL({
      typeDefs,
      resolvers,
      driver,
      debug: true,
    });

    // const neoSchema = new Neo4jGraphQL({ typeDefs, driver, debug: true });

    // Ensure the schema is built properly
    const schema = await neoSchema.getSchema();

    const server = new ApolloServer({
      schema,
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async () => {
        if (!driver) {
          console.error("❌ ERROR: Neo4j Driver is missing in context!");
          throw new Error("Neo4j Driver not available.");
        }

        console.log("✅ Neo4j Driver is available in context.");
        return { driver };
      },
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
