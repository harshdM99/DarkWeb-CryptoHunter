from pymongo import MongoClient

class Database:
    def __init__(self, db_name, crawling_table, address_table):
        self.client = MongoClient('mongodb', 27017)
        self.db = self.client[db_name]
        self.address_table = self.db[address_table]
        self.crawling_table = self.db[crawling_table]

    def insert_link(self, link, visited=0):
        self.crawling_table.insert_one({"link": link, "visited": visited})

    def get_next_link(self):
        query = {"visited": 0}
        return self.crawling_table.find_one(query)['link']

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
