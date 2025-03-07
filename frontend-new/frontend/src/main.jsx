import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
// import './index.css'
import App from './App.jsx'

// Create Apollo Client instance
const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>  {/* Wrap App with ApolloProvider */}
      <App />
    </ApolloProvider>
  </StrictMode>
);