import requests
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
import time
import json

# Load environment variables
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class BitcoinScraper:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        self.visited_addresses = set()  
        
        while True:
            try:
                with self.driver.session() as session:
                    session.run("RETURN 1")  # Test query
                
                print("Neo4j is ready!")
                return
            except Exception:
                print("Waiting for Neo4j...")
                time.sleep(5)

    def fetch_transactions(self, address):
        """Fetch transaction history from Blockstream API."""
        url = f"https://blockstream.info/api/address/{address}/txs"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json()  # Returns a list of transactions
        else:
            print(f"Failed to fetch data for {address}: {response.status_code}")
            return None

    def store_transactions(self, address, transactions):
        """Store transactions in Neo4j."""
        new_addresses = set()
        with self.driver.session() as session:
            for tx in transactions:
                txid = tx["txid"]
                inputs = tx["vin"]  # List of inputs (senders)
                outputs = tx["vout"]  # List of outputs (receivers)

                for inp in inputs:
                    sender_address = inp.get("prevout", {}).get("scriptpubkey_address", "unknown")
                    amount = inp.get("prevout", {}).get("value", 0) / 100000000  # Convert satoshis to BTC
                    for out in outputs:
                        receiver_address = out.get("scriptpubkey_address", "unknown")
                        session.execute_write(self._create_transaction, sender_address, receiver_address, amount, txid)
                        new_addresses.add(sender_address)
                        new_addresses.add(receiver_address)

        return new_addresses

    @staticmethod
    def _create_transaction(tx, sender_address, receiver_address, amount, txid):
        """Neo4j query to create nodes and relationships for transactions."""
        query = """
        MERGE (sender:Address {id: $sender})
        MERGE (receiver:Address {id: $receiver})
        CREATE (sender)-[:SENT {amount: $amount, txid: $txid}]->(receiver)
        """
        tx.run(query, sender=sender_address, receiver=receiver_address, amount=amount, txid=txid)

    @staticmethod
    def load(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def scrape_and_store(self, address, depth=5):
        """Main function to fetch and store Bitcoin transactions."""
        if depth == 0 or address in self.visited_addresses:
            return  # Stop recursion when depth limit is reached

        self.visited_addresses.add(address)  # Mark address as visited
        transactions = self.fetch_transactions(address)
        
        if transactions:
            new_addresses = self.store_transactions(address, transactions)
            print(f"Transactions for {address} stored in Neo4j! Depth: {depth}")

            # Recursively fetch transactions for newly discovered addresses
            for new_address in new_addresses:
                if new_address not in self.visited_addresses:
                    self.scrape_and_store(new_address, depth - 1)
        else:
            print(f"No transactions found for {address}.")

    def close(self):
        """Close Neo4j connection."""
        self.driver.close()

# Example usage
if __name__ == "__main__":
    scraper = BitcoinScraper()
    btc_addresses = scraper.load("btc_addr.json")

    for addr in btc_addresses:
        scraper.scrape_and_store(addr, 3)
    
    scraper.close() 