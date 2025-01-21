# Dark Web Bitcoin Gathering and Analysis

A project designed to crawl the dark web to extract Bitcoin wallet addresses and visualize their transaction graphs for analysis.

## Features

1. **Dark Web Crawling**: Extract Bitcoin addresses from `.onion` sites using the Tor network.
2. **Data Storage**: Store crawled data, metadata, and transaction details in a MongoDB database.
3. **Graph Visualization**: Visualize Bitcoin transactions and wallet connections using an interactive graph.

---

## Project Setup

### Prerequisites

- **Tor Browser**: Required for crawling `.onion` websites. Install it from [Tor Project](https://www.torproject.org/).
- **Python**: Version 3.7 or higher.
- **MongoDB**: Install and set up MongoDB for storing crawled data.
- **GeckoDriver**: Required for controlling the Firefox browser used by `tbselenium`. Download it from [Mozilla GeckoDriver Releases](https://github.com/mozilla/geckodriver/releases). 
  - **Important**: Ensure that the GeckoDriver is added to your system's `PATH` variable. This step is **compulsory** for the application to work correctly.


### Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd DarkWebCryptoHunter

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt

3. Configure the project:
   - Update the `config.py` file with the following:
     - **TOR_PATH**: Path to your Tor browser.
     - **DB_NAME**: Name of the MongoDB database.
     - **URL**: Seed `.onion` URL for the crawler.

4. Start MongoDB:
   ```bash
   mongod --dbpath <your-db-path>


## Usage

### Start Crawling
Run the `main.py` script to initiate the crawling process:
```bash
python backend/main.py
```
### Visualize Data
Open the frontend:
```bash
cd frontend
open index.html
```

### The Graph Displays:
- **Nodes**: Bitcoin wallet addresses.
- **Edges**: Transactions between addresses.

## **Directory Structure**  

```plaintext
DarkWebCryptoHunter/
│
├── frontend/                         # Frontend for visualization
│   ├── index.html                    # Main webpage
│   ├── css/
│   │   └── style.css                 # Styles for the website
│   └── js/
│       └── script.js                 # Logic for graph visualization
│
├── backend/                          # Backend for crawling and processing data
│   ├── crawler.py                    # Dark web crawler
│   ├── database.py                   # Handles database operations
│   ├── bitcoin_address_extractor.py  # Extracts Bitcoin addresses from raw data
│   ├── config.py                     # Configuration constants
|   ├── analysis.py                   # Analyze the extracted addresses to generate graphs
│   └── main.py                       # Entry point for backend logic
│
├── requirements.txt                  # Python dependencies
└── README.md                         # Project documentation
```

## **Further Development**  
While the current implementation provides static data visualization, the following enhancements can be added:

1. **Real-Time Crawling**: Enable live crawling of the dark web for updated Bitcoin transaction data.
2. **Advanced Analytics**: Add statistical analysis features to identify suspicious patterns automatically.
3. **Depth Customization**: Allow users to customize the depth of transaction analysis in the graph.