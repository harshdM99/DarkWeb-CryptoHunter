import React from "react";
import { useQuery, gql } from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import Graph from "./Graph"; 

// TODO: remove: Adds debug messages (only needed for dev)
loadDevMessages();
loadErrorMessages();

const App = () => {

    return (
        <div>
            <Graph address={"18gs3qDmznjKagNJrcgN2T3aUe3McG7iKJ"}/>
        </div>
    );
};

export default App;