// init-mongo.js
print("Initializing MongoDB: Creating database and collections...");

db = db.getSiblingDB("crawlerData1"); // Create database if not exists

// Create collections if they don't exist
if (!db.getCollectionNames().includes("websites")) {
  db.createCollection("websites");
}
if (!db.getCollectionNames().includes("crawl_links")) {
  db.createCollection("crawl_links");
}

print("✅ MongoDB initialization complete.");
