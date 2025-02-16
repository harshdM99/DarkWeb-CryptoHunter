FROM python:latest

# Switch to root user to install dependencies
USER root

# Install Tor and Python Virtual Environment
RUN apt-get update && apt-get install -y \
    tor wget firefox-esr xvfb \
    libgtk-3-0 libdbus-glib-1-2 libxt6 libx11-xcb1 libxcb-shm0 libxcb-dri3-0 libasound2 

# Manually install Geckodriver (if missing)
RUN wget -q "https://github.com/mozilla/geckodriver/releases/download/v0.35.0/geckodriver-v0.35.0-linux64.tar.gz" -O geckodriver.tar.gz
RUN tar -xzf geckodriver.tar.gz
RUN chmod +x geckodriver
RUN mv geckodriver /usr/bin/geckodriver

# Create /run/tor and set correct permissions
# RUN mkdir -p /run/tor && chmod 777 /run/tor

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Create a virtual environment and install dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Start Tor and run the crawler **inside the virtual environment**
# CMD ["/bin/sh", "-c", "service tor start && python3 main.py"]
CMD ["/bin/sh", "-c", "service tor start && Xvfb :99 -screen 0 1920x1080x24 & export DISPLAY=:99 && python3 main.py"]