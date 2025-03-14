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
      sender 
      receiver
      amount
    }
  }
`;

const Graph = ({ address }) => {
    const [selectedAddress, setSelectedAddress] = useState("18gs3qDmznjKagNJrcgN2T3aUe3McG7iKJ");
    const { loading, error, data } = useQuery(GET_GRAPH_DATA, {
      variables: { id: selectedAddress },
    });

    const addressList = ["18gs3qDmznjKagNJrcgN2T3aUe3McG7iKJ", "3DKavLP7CPWPqF4Mr3MyEpxbMNKwVKduZt", "15w4L77KbGUzij3pnt5fgmyEFCWNabegB5", "1JRGrUdT6wFn1A5r6sW21dJQwtvC742cQv", "3JTFyDPUE64f6rAqpcDR6ozj2gC4siy6am", "3FLWEkf3REFVNxZutjxA4eXeijzS9kycFi", "18bctM9KQG3e5hHP8r1w5NQPd8CCByiNAf", "1uaPF2fsmYmkXv3XswELowupQDaQ45GNn", "3GFTt3etxbQXLz35ccNcm8BHV6xy5LUeoH", "12h8BbuTYYC6zWpTNfbYoGv4LpVGv38MUx", "1BiBLE4U2fLzhr5i2nt1Uxz57CzWktdTSv", "19ESxFFN5fUs95xJFmNZnF2juPZnm53eq1", "16MSWSXgSd8YGJY6vbN9o2JipXbsoFmLtR", "1NvhNrBe2YorNfRtxe7ftjHgz4CkRuPFtC", "12pWtTFEQeUcv96UdcwgU9JfUUme9hq3XH", "1GaGNqVF3Bj7pCXNv1wurPtyoS7GNgq8wd", "1NqWh9SqL8hRgA2RCisb3rjRusEbPLdH7D", "16P3pyRABTSsBFaKYfWpTv4nUGDbFqUKvn", "3AdCmv14y8HdWcNakMvsSo3NpezjpvwNtn", "1B7E2o6ALyCtANbJt4KQNdM4BGzYCvyeLR", "1ECaLb6QMWQeA1mRMffXdPNgpSUSqsqtyh"]
    const containerRef = useRef(null);
    const networkRef = useRef(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [selectedNode, setSelectedNode] = useState(null);

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
        const edges = []
        
        nodes.set(selectedAddress, {
            id: selectedAddress,
            label: "●", 
            title: `Address: ${selectedAddress}`,  // ✅ Show address on hover
            color: {
                background: "#28a745",   // ✅ Green for main node (Bootstrap Success Green)
                border: "#155724"        // ✅ Darker green border for contrast
            },
            borderWidth: 3,  // ✅ Make border thicker
            size: 40,        // ✅ Increase size for main node
            font: { color: "white", size: 18, face: "Arial" }
        });

        data.transactions_2.forEach( (tx, index) => {
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
            
            edges.push({
                from: tx.sender,
                to: tx.receiver,
                arrows: { to: { enabled: true, scaleFactor: 1.5 } },
                label: `${parseFloat(tx.amount).toFixed(4)} BTC`,
                font: { color: "#F9B500", size: 14, background: "white", align: "top" },
                color: { color: "#F9B500", highlight: "#F90", inherit: false },
                width: 2,
            });
    
        });

        // const edges = data.transactions.map((tx, index) => ({
        //     from: address,
        //     to: tx.receiver,
        //     arrows: {
        //         to: { enabled: true, scaleFactor: 1.5 }
        //     },
        //     label: `${parseFloat(tx.amount).toFixed(4)} BTC`,
        //     font: { color: "#000", size: 14, background: "white", align: "top", },
        //     color: {
        //         color: "#F9B500",
        //         highlight: "#F90",
        //         inherit: false
        //     },
        //     width: 2,
        //     smooth: {
        //         type: "curvedCW",    // ✅ Makes sure edges **curve instead of overlap**
        //         // roundness: 0.3 + (index % 2) * 0.1  // ✅ Adds slight **random offset** to avoid collision
        //     },
        // }));

        console.log("✅ Transactions Data:", data.transactions_2);

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
                hidden:false,
                arrows: { to: { enabled: true, scaleFactor: 1.5 } },
                color: { color: "#F9B500", highlight: "#F90" },
                width: 2,
                smooth: {
                    type: "curvedCW",  // ✅ **Curves edges to avoid overlap**
                    roundness: 0.1     // ✅ Adjust roundness to make edges visible
                },
                chosen: false,
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

            <label>Select Address:</label>
            <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
                <option value="">-- Select Address --</option>
                {addressList.map((address) => (
                    <option key={address} value={address}>{address}</option>
                ))}
            </select>

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
                {selectedAddress && (
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
                )}
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