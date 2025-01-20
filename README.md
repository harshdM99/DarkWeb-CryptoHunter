# DarkWebCryptoHunter

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

### Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd DarkWebCryptoHunter