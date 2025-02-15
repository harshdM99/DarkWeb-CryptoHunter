# # Use an official lightweight Python image as a base
# FROM python:3.9-slim

# # Set environment variables
# ENV TOR_PATH="/opt/tor-browser_en-US/"

# # Install necessary packages
# RUN apt-get update && apt-get install -y \
#     tor \
#     wget \
#     xvfb \
#     x11-utils \
#     xdg-utils \
#     gnupg \
#     curl \
#     unzip \
#     && apt-get clean

# # Add MongoDB repository and install the MongoDB shell (`mongosh`)
# RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-keyring.gpg \
#     && echo "deb [signed-by=/usr/share/keyrings/mongodb-keyring.gpg] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list \
#     && apt-get update \
#     && apt-get install -y mongodb-org-shell

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Create Tor Browser directory
# RUN mkdir -p $TOR_PATH

# RUN apt-get install -y xz-utils file

# # Dynamically fetch the latest Tor Browser version
# RUN export TOR_VERSION=$(curl -fsSL https://dist.torproject.org/torbrowser/ | grep -o 'tor-browser-linux64-[0-9.]\+_en-US.tar.xz' | head -n 1) && \
#     echo "Downloading Tor Browser version: $TOR_VERSION" && \
#     curl -fsSL -o /tmp/tor.tar.xz "https://dist.torproject.org/torbrowser/$TOR_VERSION" || \
#     curl -fsSL -o /tmp/tor.tar.xz "https://mirror.torproject.org/torbrowser/$TOR_VERSION"

# # ✅ Verify the file before extracting
# RUN file /tmp/tor.tar.xz && \
#     tar -xf /tmp/tor.tar.xz -C /opt/ && \
#     rm /tmp/tor.tar.xz

# # Copy project files
# WORKDIR /app
# COPY . .

# # Expose MongoDB default port
# EXPOSE 27017

# # Start the Tor service and run the crawler
# CMD ["bash", "-c", "tor & sleep 5 && python main.py"]


FROM ubuntu:20.04

RUN apt update && apt install -y python3.8 python3-pip wget
RUN pip3 install tbselenium selenium pymongo

RUN wget https://www.torproject.org/dist/torbrowser/14.0.4/tor-browser-linux-x86_64-14.0.4.tar.xz
RUN tar -xf tor-browser-linux-x86_64-14.0.4.tar.xz

WORKDIR /app
COPY . .

EXPOSE 27017

# tor path
# /tor-browser/Browser/firefox

# ENTRYPOINT [ "python3 /app/main.py" ]