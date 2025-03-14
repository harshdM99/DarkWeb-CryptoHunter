import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import fs from "fs";
import { toGraphQLTypeDefs } from "@neo4j/introspector";

dotenv.config();

// Connect to Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://neo4j:7687",
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Define GraphQL Schema
// type Transaction @node {
//   amount: Float
//   receiver: Address @relationship(type: "SENT", direction: IN)
//   sender: Address @relationship(type: "SENT", direction: OUT)
// }

// sentTransactions: [Address!]! @relationship(type: "SENT", direction: OUT)
// receivedTransactions: [Address!]! @relationship(type: "SENT", direction: IN)

const typeDefs = `
    type Address @node {
        id: ID!
        sentAddresses: [Address!]! @relationship(type: "SENT", direction: OUT, properties: "SentProperties")
        addressesSent: [Address!]! @relationship(type: "SENT", direction: IN, properties: "SentProperties")
    }

    type SentProperties @relationshipProperties {
        amount: Float!
        txid: String!
    }

    type Query {
      addresses: [Address!]!
        @cypher(statement: "MATCH (a:Address) RETURN a LIMIT 20", columnName: "a")
      address(id: ID!): Address 
        @cypher(statement: "MATCH (a:Address {id: $id}) RETURN a", columnName: "a")
      transactions(id: ID!): [Transaction!]!
        @cypher(statement: "MATCH (a:Address {id: $id})-[r:SENT]->(b:Address) RETURN { sender: a.id, receiver: b.id, amount: r.amount, txid: r.txid } AS transactions", columnName: "transactions")
      transactions_2(id: ID!): [Transaction!]!
        @cypher(
          statement:"""
            MATCH (a:Address {id: $id})-[r:SENT]->(b:Address)
            WHERE a.id <> b.id
            WITH a.id AS sender, b.id AS receiver, SUM(r.amount) AS total_amount
            RETURN {
                sender: sender,
                receiver: receiver, 
                amount: total_amount
            } AS transactions
          """,
          columnName: "transactions"
        )
    }

    type Transaction {
      sender: ID!
      receiver: ID!
      amount: Float!
      txid: String!
    }
`;

(async () => {
  try {
    console.log("⏳ Initializing Neo4jGraphQL schema...");

    // const resolvers = {
    //   Query: {
    //     transactions: async (_, { id }, context) => {
    //       const session = context.driver.session();
    //       try {
    //         const query = `
    //           MATCH (a:Address {id: "${id}")-[r:SENT]->(b:Address)
    //           RETURN a.id AS sender, b.id AS receiver, r.amount AS amount, r.txid AS txid
    //           `;
    //         const result = await session.run(query);

    //         return result.records.map((record) => ({
    //           sender: record.get("sender"),
    //           receiver: record.get("receiver"),
    //           amount: record.get("amount"),
    //           txid: record.get("txid"),
    //         }));
    //       } catch (error) {
    //         console.error("❌ Neo4j Query Error:", error);
    //         return [];
    //       } finally {
    //         await session.close();
    //       }
    //     },
    //   },
    // };

    const neoSchema = new Neo4jGraphQL({
      typeDefs,
      // resolvers,
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
