import { MongoClient } from 'mongodb';
import { eventExists } from './utils/other.js';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

// WRITING TO MONGODB WILL BE FOR THE ODDS DATA
/** EVENT METADATA STRUCTURE
 * eventId -> bets
 * bets will just be:
[
  {
    type: "Full Time",
    name: "Match",
    offers: [
      {
        bookmaker: "XYZ",
        bookmakerId: 123,
        link: "XYZ.com",
        team1Odds: x,
        draw: y,
        team2Odds: z,
      },
      {
        bookmaker: "ABC",
        bookmakerId: 456
        link: "ABC.com",
        team1Odds: a,
        draw: b,
        team2Odds: c,
      },
    ],
  },
  (for now the full time match result will be the only bet)
]
 */

/**
 * Connects to the MongoDB database
 * @returns {MongoDB} the newly connected database
 */
export async function connect() {
  try {
    await client.connect();
    db = client.db('Odds-Data');
    return db;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Disconnects from the MongoDB database
 */
export async function close() {
  await client.close();
  console.log("MongoDB connection closed");
}
