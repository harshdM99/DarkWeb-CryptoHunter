# crawler.py
import re
import os
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.common.exceptions import NoSuchElementException
from bitcoin_address_extractor import BitcoinAddressExtractor
from selenium.webdriver.common.by import By
import time

class Crawler:
    def __init__(self, db, CRAWL_LIMIT):
        self.db = db
        self.crawl_limit = int(CRAWL_LIMIT)

        options = Options()
        options.headless = True  # Run in headless mode (no GUI)
        
        # Configure Firefox to use Tor's SOCKS5 proxy
        options.set_preference("network.proxy.type", 1)
        options.set_preference("network.proxy.socks", "127.0.0.1")
        options.set_preference("network.proxy.socks_port", 9050)
        options.set_preference("network.proxy.socks_remote_dns", True)
        
        os.environ["DISPLAY"] = ":99"

        # Start a headless Firefox browser
        service = Service("/usr/bin/geckodriver")
        self.driver = webdriver.Firefox(service=service, options=options)
        print("Driver successfully started! Printing Variable driver : ", self.driver)

    def crawl(self, url):
        for _ in range(self.crawl_limit):
            try:
                if url == None:
                    print("No more URL found. exiting.....")
                    return

                self.driver.get(url)
                self.store_all_links()
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

    def store_all_links(self):
        if "neterror" in self.driver.current_url:
            print(f"Page load error detected: {self.driver.current_url}")
            return  

        elems = self.driver.find_elements(By.XPATH, "//a[@href]")
        for elem in elems:
            link = elem.get_attribute("href")
            match = re.search('.onion', link)
            if match:
                self.db.insert_link(link, 0)

    def get_page_text(self):
        return self.driver.find_element(By.XPATH, "/html/body").text

    def get_metadata(self):
        try:
            return self.driver.find_element(By.XPATH, "//meta[@name='description']").get_attribute("content")
        except NoSuchElementException:
            return []