#create and get the database ready
from pymongo import MongoClient
from tbselenium.tbdriver import TorBrowserDriver
from Bitcoin_address import Bitcoin_Address as ba
from selenium.common.exceptions import NoSuchElementException

CRAWL_LIMIT=646

client = MongoClient('localhost', 27017)
db = client['crawlerData1']     #CREATES A DATABASE crawlerData1
table1 = db['websites']       #CREATES A COLLECTION websites, collection means table
table2 = db['crawl_links'] #another table to store only links for crawling purpose

driver = TorBrowserDriver("/opt/tor-browser_en-US/")

# INPUTTING INITIAL DATA
# CHOOSE ONE seed url
# url = 'https://www.blockchain.com/btc/tx/826af504d2dceb57db11054f3a62f386ee10e88a361c21f37642cf6d1ccefdcc'
# url = 'https://3g2upl4pq6kufc4m.onion/'
url = 'http://thehiddenwiki.org/'

table2.insert_one({"link": url, "visited": 1})

#for interleaved crawling
query = { "visited": 0 }
url= table2.find_one(query)['link']

for i in range(CRAWL_LIMIT):
    try:
        driver.get(url)

        # storing all links on the webpage
        allLinks =[]
        elems = driver.find_elements_by_xpath("//a[@href]")
        for elem in elems:
            link = elem.get_attribute("href")
            match = re.search('.onion', link)
            
            if match:
               allLinks.append(link) 

        # getting all text from this particular webpage
        text=driver.find_element_by_xpath("/html/body").text

        #extracting ONLY bitcoin addresses from the entire text
        win_len=26
        bc_flag=False
        i=0
        addresses=[]
        while i<=(len(text)-26):
            win_len=26
            if text[i]=='1' or text[i]=='3':
                while win_len<=35:
                    if ba.check_bc(text[i:i+win_len]):
                        addresses.append(text[i:i+win_len])
                        win_len=26
                        break
                    else:
                        #print(text[i:i+win_len])
                        win_len+=1
            #print(i)
            i+=1


        #STORING IN THE DATABASES
        #table1: details about individual pages
        #table2: links to continue crawling
        try:
            metadata = driver.find_element_by_xpath("//meta[@name='description']").get_attribute("content")
        except NoSuchElementException:
            metadata=[]

        #only insert if the web page actually contains a bitcoin address
        if(len(addresses)>0):
            record= { "link": url,
                      "metadata": metadata,
                      "bitcoin addresses": addresses }
            x= table1.insert_one(record)




#         record_links=[]
#         for link in allLinks:
#             if(table2.find( { "link": link } ).count() == 0):
#                 #record_links.append({"link": link, "visited":0})
#                 x= table2.insert_one({"link": link, "visited":0})

        #insert many approach 
        #if(len(record_links)!=0):
        #    x= table2.insert_many(record_links)

        #set the visited to 1 in table2
        query = { "link": url }
        newvalue = { "$set": { "visited": 1 } }
        table2.update_one(query, newvalue)

        query = { "visited": 0 }
        url= table2.find_one(query)['link']

#         #choosing the next URL to crawl which is NOT VISITED
#         query = { "visited": 0 }
#         url= table2.find_one(query)['link']
    
    except:
        #choosing the next URL to crawl which is NOT VISITED
        #set the url which gives exception to visited
        query = { "link": url }
        newvalue = { "$set": { "visited": 1 } }
        table2.update_one(query, newvalue)
        
        query = { "visited": 0 }
        url= table2.find_one(query)['link']    