// init-mongo.js
print("Initializing MongoDB: Creating database and collections...");

// Read environment variables from Docker (passed via `docker-compose.yml`)
var dbName = process.env.DB_NAME;
var seedUrl = process.env.URL;
var crawlTable = process.env.CRAWLING_TABLE;
var addressTable = process.env.ADDRESS_TABLE;

db = db.getSiblingDB(dbName); // Use database from .env

// Create collections if they don't exist
if (!db.getCollectionNames().includes(addressTable)) {
  db.createCollection(addressTable);
}
if (!db.getCollectionNames().includes(crawlTable)) {
  db.createCollection(crawlTable);
}

// Insert a seed URL if the collection is empty
if (db[crawlTable].countDocuments({}) === 0) {
  db[crawlTable].insertOne({
    link: seedUrl,
    visited: 0,
  });
  print("✅ Seed URL inserted into " + crawlTable + ": " + seedUrl);
} else {
  print(
    "✅ Seed URL already exists in " + crawlTable + ", skipping insertion."
  );
}

print("✅ MongoDB initialization complete.");
