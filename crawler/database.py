from pymongo import MongoClient

class Database:
    def __init__(self, db_name):
        self.client = MongoClient('localhost', 27017)
        self.db = self.client[db_name]
        self.table1 = self.db['websites']
        self.table2 = self.db['crawl_links']

    def insert_link(self, link, visited=0):
        self.table2.insert_one({"link": link, "visited": visited})

    def get_next_link(self):
        query = {"visited": 0}
        return self.table2.find_one(query)['link']

    def update_link_visited(self, link):
        query = {"link": link}
        new_value = {"$set": {"visited": 1}}
        self.table2.update_one(query, new_value)

    def insert_page_data(self, url, metadata, addresses):
        record = {
            "link": url,
            "metadata": metadata,
            "bitcoin addresses": addresses
        }
        self.table1.insert_one(record)
