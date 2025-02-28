import React from "react";
import { useQuery, gql } from "@apollo/client";
import CytoscapeComponent from "react-cytoscapejs";

const GET_GRAPH_DATA = gql`
  query GetTransactions {
    addresses(id: $id) {
      id
      transactions {
        amount
        receiver {
          id
        }
      }
    }
  }
`;

const Graph = ({ address }) => {
    const { loading, error, data } = useQuery(GET_GRAPH_DATA, {
        variables: { id: address },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Convert Neo4j data to Cytoscape.js format
    const elements = [
        { data: { id: address, label: address, color: "blue" } },
        ...data.address.transactions.map(tx => ({
            data: {
                id: `${address}->${tx.receiver.id}`,
                source: address,
                target: tx.receiver.id,
                label: `BTC: ${tx.amount}`,
            }
        })),
    ];

    return (
        <CytoscapeComponent
            elements={elements}
            style={{ width: "100%", height: "500px" }}
            layout={{ name: "cose" }}
        />
    );
};

export default Graph;