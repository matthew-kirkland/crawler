import { MongoClient } from 'mongodb';
import Fuse from 'fuse.js';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;
const clients = [];

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

/**
 * Clears the MongoDB database
 */
export async function clearDb() {
  await db.collection('Sports').deleteMany({ });
}

/**
 * Removes expired events from the database
 */
export async function clearOldEvents() {
  const timeNow = new Date();
  await db.collection('Sports').deleteMany({ startTime: { $lt: timeNow } });
}

/**
 * Determines if an event already exists in the database
 * @param {object} thisEvent the event to inspect
 * @returns {} the existing event, if it is in the database, otherwise null
 */
export async function eventExists(thisEvent) {
  const events = await db.collection('Sports').find({ }).toArray();
  for (const event of events) {
    if (eventsMatch(event, thisEvent)) {
      return event;
    }
  }
  return null;
}

/**
 * Determines if two events are the same based on their factors
 * @param {object} event1
 * @param {object} event2
 * @returns {boolean} true if the two events are deemed to be the same, false otherwise
 */
function eventsMatch(event1, event2) {
  if (event1.startTime.getTime() != event2.startTime.getTime()) return false;

  const team1Match = fuzzyMatch(event1.team1Name, event2.team1Name);
  const team2Match = fuzzyMatch(event1.team2Name, event2.team2Name);
  const leagueMatch = fuzzyMatch(event1.league, event2.league);
  return team1Match && team2Match && leagueMatch;
}

/**
 * Determines string similarity
 * @param {string} str1
 * @param {string} str2
 * @returns {boolean} true if two strings are 80% similar, false otherwise
 */
function fuzzyMatch(str1, str2) {
  if (str1 == null || str2 == null) {
    console.log(`either ${str1} or ${str2} was null`);
    return false;
  }
  const fuse = new Fuse([{ text: str2 }], { keys: ["text"], includeScore: true, threshold: 0.9 });
  const result = fuse.search(str1);
  return result.length > 0;
}

export { db, clients }
