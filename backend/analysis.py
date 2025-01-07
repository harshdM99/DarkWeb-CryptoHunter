# ADDITIONAL EXPERIMENTATION AND ANALYSIS

import time
import re
import networkx as nx
# import matplotlib.pyplot as plt
from selenium import webdriver
from selenium.webdriver.common.by import By
from pyvis import network as nt

driver=webdriver.Firefox()

# Define the AddressNode class (make sure this is defined somewhere in your code)
class AddressNode:
    def __init__(self, addr):
        self.addr = addr
        self.sent_to = set()  # Set to track addresses this address has sent to
        self.trans = set()    # Set to track transactions associated with this address
        self.bal = '0.'       # Set default balance to '0.'

    def set_sent(self, sent_addresses):
        self.sent_to.update(sent_addresses)

    def add_transaction(self, trans_address):
        self.trans.add(trans_address)


# Function to trim amount by removing non-breaking spaces
def trim_amt(amt):
    amt[0] = amt[0].rstrip('&nbsp;')
    return amt

# Function to trim and clean the address string
def trim_addr(addr, wall):
    addr = addr.replace(wall, "")
    addr = addr.lstrip("Address ")
    return addr.rstrip('\n')

# Filter and return addresses from the transaction pages
def addr_list_trim(addr_list):
    return [i for i in addr_list if re.findall(".*/address/.*", i)]

# Extract number of pages from the page count string
def trim_page_count(page_count):
    x = re.findall("/ .", page_count)
    y = re.search("\d", str(x))
    return y.group() if y else None

# Generate page links based on the number of pages
def get_pages(page_count, url):
    total_pages = int(trim_page_count(page_count))
    return [f'{url}?page={i}' for i in range(2, total_pages + 1)] if total_pages > 1 else []

# Extract address from the URL
def get_addr(url):
    test_my = re.search('address/(.*)\?|address/(.*)', url)
    return test_my.group(1) if test_my.group(1) else test_my.group(2)

# Scrape the first page of an address
def scrape_addr_page1(url):
    driver.get(url)
    out, sent_tran = [], []
    curr_addr = get_addr(url)
    amt_diff = driver.find_elements(By.XPATH, '//tr/td[@class="amount diff"]')
    txid = driver.find_elements(By.XPATH, '//tr/td[@class="txid"]/a[@href]')
    
    for x, y in zip(amt_diff, txid):
        if x.get_attribute('innerHTML')[0] == '-':
            sent_tran.append(y.get_attribute('href'))
        out.append([x.get_attribute('innerHTML'), curr_addr, y.get_attribute('href')])

    out = list(map(trim_amt, out))
    page_count = driver.find_element(By.XPATH, "//div[@class='paging']").text
    page_list = get_pages(page_count, url)
    return out, sent_tran, page_list

# Scrape other pages of an address
def scrape_addr_other(url):
    driver.get(url)
    out, sent_tran = [], set()
    curr_addr = get_addr(url)
    amt_diff = driver.find_elements(By.XPATH, '//tr/td[@class="amount diff"]')
    txid = driver.find_elements(By.XPATH, '//tr/td[@class="txid"]/a[@href]')
    
    for x, y in zip(amt_diff, txid):
        if x.get_attribute('innerHTML')[0] == '-':
            sent_tran.add(y.get_attribute('href'))
        out.append([x.get_attribute('innerHTML'), curr_addr, y.get_attribute('href')])

    out = list(map(trim_amt, out))
    return out, sent_tran

# Scrape transaction ID pages for input/output addresses
def scrape_txid(url):
    driver.get(url)
    new_addr = driver.find_elements(By.XPATH, '//table[@class="empty"]/tbody/tr/td/a[@href]')
    x = driver.find_elements(By.XPATH, '//table[@class="tx"]/tbody/tr/th/b')
    ip = re.search(' \d+ ', x[0].get_attribute('innerHTML')).group()
    op = re.search(' \d+ ', x[0].get_attribute('innerHTML')).group()
    
    ip_addr_list, op_addr_list = [], []
    ip_addr_set, op_addr_set = set(), set()
    i = 0

    for addr in new_addr:
        if 'address' in addr.get_attribute("href"):
            if i < int(ip):
                ip_addr_list.append(addr.get_attribute("href"))
                ip_addr_set.add(re.search('address/(.*)', addr.get_attribute("href")).group(1))
            else:
                op_addr_list.append(addr.get_attribute("href"))
                op_addr_set.add(re.search('address/(.*)', addr.get_attribute("href")).group(1))
            i += 1

    return ip_addr_list, op_addr_list, ip_addr_set, op_addr_set

# Decision function to decide which scraper to use based on URL
def decision_func(url):
    test_url = re.search('address/(.*)\?|address/(.*)|txid/(.*)', url)
    
    if test_url.group(1):
        # Address page (other pages)
        return scrape_addr_other(url)
    elif test_url.group(2):
        # First page of address
        return scrape_addr_page1(url)
    elif test_url.group(3):
        # Transaction ID page
        return scrape_txid(url)
    else:
        print("Wrong URL format.")
        return None

# Refactor the crawl_time function to remove redundancies
def crawl_time(url, all_links=[], addresses=dict()):
    try:
        for i in range(5):  # Limit crawling to 5 pages
            print(f'URL: {url}')
            output = decision_func(url)
            
            # Handle 'txid' URLs (transactions)
            if 'txid' in url:
                for x in output[2] + output[3]:
                    if x not in addresses:
                        addresses[x] = AddressNode(x)
                    addresses[x].add_transaction(x)
                    all_links.extend(addresses[x].trans)
            
            # Handle 'address' URLs
            elif 'address' in url:
                if len(output) == 3 and output[2]:
                    all_links.extend(output[2] + [l[2] for l in output[0]])
                elif len(output) == 3:
                    all_links.extend([l[2] for l in output[0]])
                elif len(output) == 2:
                    all_links.extend([l[2] for l in output[0]])

            url = all_links.pop(0)  # Get the next URL to crawl
            print(f'Next URL: {url}')
        
        time.sleep(10)
        return addresses, all_links
    except Exception as e:
        print(f'Error during crawling: {e}')
        return addresses, all_links


# Refactor the create_graph function
def create_graph(addresses):
    edges = []
    nodes = set()
    G = nx.DiGraph()

    for addr, node in addresses.items():
        # Create nodes for the sender address
        if addr not in nodes:
            color = '#ED5853' if node.bal == '0.' else '#239E91'
            G.add_node(addr, title=addr, color=color, size=25 if node.bal != '0.' else 5)
            nodes.add(addr)
        
        # Create edges for sent transactions
        for sent_addr in node.sent_to:
            edges.append((addr, sent_addr))
            if sent_addr not in nodes:
                G.add_node(sent_addr, title=sent_addr, color='#239E91', size=5)
                nodes.add(sent_addr)
    
    G.add_edges_from(edges, color='#F9F2E5')
    
    # plt.figure(figsize=(20, 20))
    # nx.draw_shell(G, node_size=3750)
    return edges, G

# Higher-level abstraction function to crawl URLs
def aio_crawl(url, all_links=[], addresses=dict()):
    returned_addresses, returned_links = crawl_time(url, all_links, addresses)
    addresses.update(returned_addresses)

    for i in range(5):
        if returned_links:
            url = returned_links.pop(0)
            returned_addresses, returned_links = crawl_time(url, all_links, addresses)
            addresses.update(returned_addresses)

    return addresses, returned_links

# Run the highest-level crawl and generate graph
def run_crawl_and_generate_graph(initial_url):
    ret_addr, links_left = aio_crawl(initial_url)
    edges, nx_graph = create_graph(ret_addr)

    # Visualize the graph with pyvis
    net = nt.Network(notebook=True, bgcolor='#222222', font_color='white', width='100%', height='750px')
    net.show_buttons(filter_=['physics'])
    net.from_nx(nx_graph)
    net.show('net.html')

    return ret_addr, edges, nx_graph

# Example of running the code
initial_url = 'https://www.walletexplorer.com/address/12h8BbuTYYC6zWpTNfbYoGv4LpVGv38MUx'
run_crawl_and_generate_graph(initial_url)
driver.quit()