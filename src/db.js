const { MongoClient } = require("mongodb");

let cachedDb = null;

async function connectDB() {
    // 🔁 Cached connection থাকলে সেটাই রিটার্ন করো
    if (cachedDb) {
        return cachedDb;
    }

    // Priority: Atlas → Local
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
        throw new Error("❌ MongoDB URI not found in environment variables");
    }

    const client = new MongoClient(uri, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        maxPoolSize: 10, // connection pooling
    });

    await client.connect();

    const dbName = "campus2clients_DB";
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    console.log(`✅ Connected to MongoDB (${uri.includes("localhost") ? "Local" : "Atlas"})`);
    return db;
}

module.exports = connectDB;
