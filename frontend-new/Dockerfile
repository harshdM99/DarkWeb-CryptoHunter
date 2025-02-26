FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
# COPY . .

# Expose port 3000
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]
