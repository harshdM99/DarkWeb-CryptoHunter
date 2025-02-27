import React from "react";
import { useQuery, gql } from "@apollo/client";

const GET_ADDRESSES = gql`
  query {
    addresses {
      id
      transactions {
        amount
      }
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
            <ul>
                {data.addresses.map((address) => (
                    <li key={address.id}>
                        {address.id}: {address.transactions.length} transactions
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;