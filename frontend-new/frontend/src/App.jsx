import React from "react";
import { useQuery, gql } from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import Graph from "./Graph"; 

// TODO: remove: Adds debug messages (only needed for dev)
loadDevMessages();
loadErrorMessages();

// const GET_ADDRESSES = gql`
//   query {
//     addresses {
//       id
//       transactions {
//         amount
//       }
//     }
//   }
// `;

const GET_ADDRESSES = gql`
  query {
    addresses {
      id
    }
  }
`;

const App = () => {
    const { loading, error, data } = useQuery(GET_ADDRESSES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h2>Bitcoin Transactions</h2>
            <Graph address={"18gs3qDmznjKagNJrcgN2T3aUe3McG7iKJ"}/>
            <ul>
                {data.addresses.map((address) => (
                    <li key={address.id}>{address.id}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;