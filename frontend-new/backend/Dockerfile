# Use lightweight Node.js with Vite
FROM node:22.14-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm --version
RUN npm install

# Expose frontend port
EXPOSE 5173

# Start Vite development server
CMD ["node", "index.js"]