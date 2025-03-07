import React, { useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import { Network } from "vis-network";

const GET_GRAPH_DATA = gql`
  query GetTransactions($id: ID!) {
    transactions(id: $id) {
      amount
      txid
      receiver
    }
  }
`;

const Graph = ({ address }) => {
    const { loading, error, data } = useQuery(GET_GRAPH_DATA, {
        variables: { id: address },
    });

    const containerRef = useRef(null);
    const networkRef = useRef(null);

    useEffect(() => {
        if (loading || error || !data) return;

        // Create nodes & edges datasets
        const nodes = new Map();
        nodes.set(address, { id: address, label: "●", color: "#007bff", size: 25, font: { color: "white" } });

        const edges = data.transactions.map(tx => {
            if (!nodes.has(tx.receiver)) {
                nodes.set(tx.receiver, { id: tx.receiver, label: "●", color: "#ED5853", size: 20, font: { color: "white" } });
            }
            return { from: address, to: tx.receiver, arrows: "to", color: "#F9F2E5" };
        });

        // Convert maps to arrays
        const nodesArray = Array.from(nodes.values());
        const edgesArray = edges;

        // Graph Data
        const graphData = {
            nodes: nodesArray,
            edges: edgesArray
        };

        // Graph Options
        const options = {
            physics: {
                barnesHut: { gravitationalConstant: -9050, avoidOverlap: 1 },
            },
            interaction: {
                tooltipDelay: 200,
            },
            nodes: {
                shape: "dot",
                size: 20,
            },
        };

        // Initialize Network Graph
        if (containerRef.current) {
            networkRef.current = new Network(containerRef.current, graphData, options);

            // Zoom Controls
            document.getElementById("zoom-in").addEventListener("click", () => {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale * 1.2 });
            });

            document.getElementById("zoom-out").addEventListener("click", () => {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale / 1.2 });
            });

            // Show tooltips on hover
            networkRef.current.on("hoverNode", function (params) {
                const nodeId = params.node;
                const node = nodes.get(nodeId);
                alert(`Address: ${nodeId}`);
            });
        }
    }, [loading, error, data, address]);

    return (
        <div>
            <div id="loading">Loading graph...</div>
            <div id="network" ref={containerRef} style={{ width: "100%", height: "600px", border: "1px solid #ccc", borderRadius: "5px" }}></div>
            <button id="zoom-in">Zoom In</button>
            <button id="zoom-out">Zoom Out</button>
        </div>
    );
};

export default Graph;