from pymongo import MongoClient

class Database:
    def __init__(self, DB_NAME, CRAWLING_TABLE, ADDRESS_TABLE, SEED_URL):
        self.client = MongoClient('mongodb', 27017)
        self.db = self.client[DB_NAME]

        self.create_collections(CRAWLING_TABLE, ADDRESS_TABLE)

        self.address_table = self.db[ADDRESS_TABLE]
        self.crawling_table = self.db[CRAWLING_TABLE]

        # Insert seed URL if no unvisited links exist
        if self.crawling_table.count_documents({}) == 0:
            self.crawling_table.insert_one({"link": SEED_URL, "visited": 0})
            print(f"Seed URL inserted: {SEED_URL}")

    def create_collections(self, CRAWLING_TABLE, ADDRESS_TABLE):
        """Ensure collections exist and insert a seed URL if needed."""
        if CRAWLING_TABLE not in self.db.list_collection_names():
            self.db.create_collection(CRAWLING_TABLE)
            print(f"Created collection: {CRAWLING_TABLE}")

        if ADDRESS_TABLE not in self.db.list_collection_names():
            self.db.create_collection(ADDRESS_TABLE)
            print(f"Created collection: {ADDRESS_TABLE}")

    def insert_link(self, link, visited=0):
        if not self.crawling_table.find_one({"link": link}):
            self.crawling_table.insert_one({"link": link, "visited": visited})
        else:
            print(f"Link already exists, skipping: {link}")

    def get_next_link(self):
        query = {"visited": 0}
        result = self.crawling_table.find_one(query)
    
        if result:
            return result['link']
        else:
            print("No unvisited links found in the database.")
            return None

    def update_link_visited(self, link):
        query = {"link": link}
        new_value = {"$set": {"visited": 1}}
        self.crawling_table.update_one(query, new_value)

    def insert_page_data(self, url, metadata, addresses):
        record = {
            "link": url,
            "metadata": metadata,
            "bitcoin addresses": addresses
        }
        self.address_table.insert_one(record)
