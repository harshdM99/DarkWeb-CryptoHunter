import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./ApolloClient";
import Graph from "./components/Graph";

function App() {
    const [address, setAddress] = useState("");

    return (
        <ApolloProvider client={client}>
            <div>
                <h2>Bitcoin Transaction Graph</h2>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Bitcoin Address"
                />
                <Graph address={address} />
            </div>
        </ApolloProvider>
    );
}

export default App;