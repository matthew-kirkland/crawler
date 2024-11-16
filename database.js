import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

export async function connect() {
  try {
    await client.connect();
    db = client.db('Odds-Data');
    return db;
  } catch (error) {
    console.log(error);
  }
}

export async function close() {
  await client.close();
  console.log("MongoDB connection closed");
}