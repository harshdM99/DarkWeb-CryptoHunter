from database import Database
from crawler import Crawler
from config import DB_NAME, URL

def main():
    db = Database(DB_NAME)
    crawler = Crawler(db)

    # Insert the initial seed URL into the database
    db.insert_link(URL, visited=1)

    # Start crawling process
    next_url = db.get_next_link()
    crawler.crawl(next_url)

if __name__ == "__main__":
    main()