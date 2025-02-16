from database import Database
from crawler import Crawler
from dotenv import load_dotenv
import os

load_dotenv()
DB_NAME = os.getenv("DB_NAME", "crawlerData1")
CRAWLING_TABLE = os.getenv("CRAWLING_TABLE", "crawl_links")
ADDRESS_TABLE = os.getenv("ADDRESS_TABLE", "websites")
CRAWL_LIMIT = os.getenv("CRAWL_LIMIT", 10000)
URL = os.getenv("URL", "http://thehiddeanwiki.org/")

def main():
    db = Database(DB_NAME, CRAWLING_TABLE, ADDRESS_TABLE)
    crawler = Crawler(db, CRAWL_LIMIT)

    # Start crawling process
    next_url = db.get_next_link()
    crawler.crawl(next_url)

if __name__ == "__main__":
    main()