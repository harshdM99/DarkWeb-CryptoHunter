import React, { useEffect, useRef, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Network } from "vis-network";
import "./css/Graph.css"; // ✅ Import CSS

// const GET_GRAPH_DATA = gql`
//   query GetTransactions($id: ID!) {
//     transactions(id: $id) {
//       amount
//       txid
//       receiver
//     }
//   }
// `;

const GET_GRAPH_DATA = gql`
  query GetTransactions($id: ID!) {
    transactions_2(id: $id) {
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
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [selectedNode, setSelectedNode] = useState(null);  // ✅ Pop-up state

    useEffect(() => {
        if (loading || error || !data) return;

        console.log("✅ Data Loaded:", data);

        const networkElement = containerRef.current;
        if (!networkElement) {
            console.error("❌ #network container not found");
            return;
        }

        // Create nodes & edges datasets
        const nodes = new Map();
        nodes.set(address, { id: address, label: "●", color: "#007bff", size: 25, font: { color: "white" } });
        
        nodes.set(address, {
            id: address,
            label: "●", 
            title: `Address: ${address}`,  // ✅ Show address on hover
            color: {
                background: "#28a745",   // ✅ Green for main node (Bootstrap Success Green)
                border: "#155724"        // ✅ Darker green border for contrast
            },
            borderWidth: 3,  // ✅ Make border thicker
            size: 40,        // ✅ Increase size for main node
            font: { color: "white", size: 18, face: "Arial" }
        });

        // const edges = data.transactions.map(tx => {
        //     if (!nodes.has(tx.receiver)) {
        //         nodes.set(tx.receiver, { id: tx.receiver, label: "●", color: "#ED5853", size: 20, font: { color: "white" } });
        //     }
        //     return { from: address, to: tx.receiver, arrows: "to", color: "#F9F2E5" };
        // });

        data.transactions.forEach(tx => {
            if (!nodes.has(tx.receiver)) {
                nodes.set(tx.receiver, {
                    id: tx.receiver,
                    label: "●",
                    title: `Address: ${tx.receiver}`,  // ✅ Show address on hover
                    color: {
                        background: "#ED5853",  // ✅ Red color for receiver nodes
                        border: "#8B0000"       // ✅ Darker border for contrast
                    },
                    borderWidth: 2,
                    size: 25,  // ✅ Keep receiver nodes slightly smaller than main node
                    font: { color: "white", size: 16, face: "Arial" }
                });
            }
        });

        const edges = data.transactions.map((tx, index) => ({
            from: address,
            to: tx.receiver,
            arrows: {
                to: { enabled: true, scaleFactor: 1.5 }
            },
            label: `${parseFloat(tx.amount).toFixed(4)} BTC`,
            font: { color: "#000", size: 14, background: "white", align: "top", },
            color: {
                color: "#F9B500",
                highlight: "#F90",
                inherit: false
            },
            width: 2,
            smooth: {
                type: "curvedCW",    // ✅ Makes sure edges **curve instead of overlap**
                // roundness: 0.3 + (index % 2) * 0.1  // ✅ Adds slight **random offset** to avoid collision
            },
        }));

        const graphData = {
            nodes: Array.from(nodes.values()),
            edges: edges
        };

        const options = {
            physics: {
                enabled: true,
                barnesHut: { 
                    avoidOverlap: 1,
                    centralGravity: 0.3,
                    springLength: 300
                },
                // stabilization: { iterations: 200 },
            },
            interaction: { tooltipDelay: 200 },
            layout: {
                improvedLayout: true,  // ✅ Ensures better automatic positioning
                hierarchical: false,   // ✅ Prevents forced hierarchy
            },
            nodes: {
                shape: "dot",
                size: 20,
                font: { color: "white", size: 16, face: "Arial" },
                borderWidth: 2,
            },
            edges: {
                arrows: { to: { enabled: true, scaleFactor: 1.5 } },
                color: { color: "#F9B500", highlight: "#F90" },
                width: 2,
                smooth: {
                    type: "curvedCW",  // ✅ **Curves edges to avoid overlap**
                    roundness: 0.1     // ✅ Adjust roundness to make edges visible
                },
            },
        };

        if (containerRef.current) {
            networkRef.current = new Network(containerRef.current, graphData, options);

            // ✅ Handle Loading Progress
            networkRef.current.on("stabilizationProgress", function (params) {
                const percentage = Math.round((params.iterations / params.total) * 100);
                setLoadingProgress(percentage);
            });

            // ✅ Hide Loading Spinner When Stabilized
            networkRef.current.once("stabilized", function () {
                networkRef.current.fit({ animation: true, maxZoomLevel: 0.8 });
            });

            networkRef.current.once("stabilizationIterationsDone", function () {
                document.getElementById("loading").style.display = "none"; // Hide loading spinner
                containerRef.current.style.display = "block"; // Show graph
            });

            networkRef.current.on("click", function (params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    setSelectedNode(nodeId);
                } else {
                    setSelectedNode(null);
                }
            });

            // ✅ Zoom Controls
            document.getElementById("zoom-in").addEventListener("click", () => {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale * 1.2 });
            });

            document.getElementById("zoom-out").addEventListener("click", () => {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale / 1.2 });
            });

            // ✅ Tooltip on Hover
            // networkRef.current.on("hoverNode", function (params) {
            //     const nodeId = params.node;
            //     // alert(`Address: ${nodeId}`);
            // });
        }
    }, [data]); // ✅ Ensures useEffect runs **only when data changes**

    return (
        <>
            <header>
                <h1>Bitcoin Address Visualization</h1>
            </header>

            <main className="container">
                <section id="explanations-section">
                    <h2>Understanding the Graph</h2>
                    <p>The graph on the right visualizes <strong>Bitcoin transactions</strong> associated with the wallet address <em>{address}</em>.</p>

                    <h3>What Do the Nodes and Edges Represent?</h3>
                    <ul>
                        <li><strong>Nodes:</strong> Represent individual Bitcoin wallet addresses.</li>
                        <li><strong>Edges:</strong> Show transactions between two addresses.</li>
                    </ul>

                    <h3>Node Colors</h3>
                    <p><span className="red-dot"></span> <strong>Red Nodes:</strong> Zero balance.</p>
                    <p><span className="green-dot"></span> <strong>Green Nodes:</strong> Holding balance.</p>

                    <h3>Interactive Features</h3>
                    <ul>
                        <li><strong>Hovering:</strong> Hover over any node (circle) to display the Bitcoin address.</li>
                        <li><strong>Zoom Controls:</strong> Use the + and - buttons to navigate.</li>
                    </ul>
                </section>

                <section id="graph-section">
                    {/* ✅ Show Loading Spinner Before Graph Loads */}
                    <div id="loading" style={{ display: loadingProgress === 100 ? "none" : "flex" }}>
                        <div id="spinner"></div>
                        <p>Loading graph: {loadingProgress}%</p>
                    </div>

                    {/* ✅ Graph Container */}
                    <div id="network" ref={containerRef} style={{ display: "none" }}></div>

                    {/* ✅ Zoom Controls */}
                    <div id="zoom-controls">
                        <button id="zoom-in" className="zoom-btn">+</button>
                        <button id="zoom-out" className="zoom-btn">-</button>
                    </div>
                </section>
            </main>

            {/* ✅ Pop-up to show selected node details */}
            {selectedNode && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Bitcoin Address</h3>
                        <p>{selectedNode}</p>
                        <button onClick={() => setSelectedNode(null)}>Close</button>
                    </div>
                </div>
            )}

            <footer>
                <p>&copy; Made By Harshdeep</p>
            </footer>
        </>
    );
};

export default Graph;