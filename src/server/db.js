import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in env');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

export async function initDB() {
  await client.connect();
  console.log('🗄️  Connected to MongoDB');
}

export function getDB() {
  return client.db('EduForums');
}
