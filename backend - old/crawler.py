# crawler.py
import re
from tbselenium.tbdriver import TorBrowserDriver
from selenium.common.exceptions import NoSuchElementException
from bitcoin_address_extractor import BitcoinAddressExtractor
from config import CRAWL_LIMIT

class Crawler:
    def __init__(self, tor_path, db):
        self.driver = TorBrowserDriver(tor_path)
        self.db = db

    def crawl(self, url):
        for i in range(CRAWL_LIMIT):
            try:
                self.driver.get(url)
                all_links = self.get_all_links()
                text = self.get_page_text()
                addresses = BitcoinAddressExtractor.extract_addresses(text)

                if addresses:
                    metadata = self.get_metadata()
                    self.db.insert_page_data(url, metadata, addresses)

                self.db.update_link_visited(url)
                url = self.db.get_next_link()

            except Exception as e:
                print(f"Error while processing {url}: {e}")
                self.db.update_link_visited(url)
                url = self.db.get_next_link()

    def get_all_links(self):
        all_links = []
        elems = self.driver.find_elements_by_xpath("//a[@href]")
        for elem in elems:
            link = elem.get_attribute("href")
            match = re.search('.onion', link)
            if match:
                all_links.append(link)
        return all_links

    def get_page_text(self):
        return self.driver.find_element_by_xpath("/html/body").text

    def get_metadata(self):
        try:
            return self.driver.find_element_by_xpath("//meta[@name='description']").get_attribute("content")
        except NoSuchElementException:
            return []