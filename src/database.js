import { MongoClient } from 'mongodb';
import Fuse from 'fuse.js';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;
const clients = [];

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
    clients.push(client);
    db = client.db('Odds-Data');
    console.log('MongoDB connection established')
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
  console.log('MongoDB connection closed');
}

export async function clearDb() {
  await db.collection('Sports').deleteMany({ });
}

export async function eventExists(thisEvent) {
  const events = await db.collection('Sports').find({ }).toArray();
  for (const event of events) {
    if (eventsMatch(event, thisEvent)) {
      return event;
    }
  }
  return null;
}

function eventsMatch(event1, event2) {
  if (event1.startTime.getTime() != event2.startTime.getTime()) return false;

  const team1Match = fuzzyMatch(event1.team1Name, event2.team1Name);
  const team2Match = fuzzyMatch(event1.team2Name, event2.team2Name);
  const leagueMatch = fuzzyMatch(event1.league, event2.league);
  return team1Match && team2Match && leagueMatch;
}

function fuzzyMatch(str1, str2) {
  if (str1 == null || str2 == null) {
    console.log(`either ${str1} or ${str2} was null`);
    return false;
  }
  const fuse = new Fuse([{ text: str2 }], { keys: ["text"], includeScore: true, threshold: 0.8 });
  const result = fuse.search(str1);
  return result.length > 0;
}

export { db }
