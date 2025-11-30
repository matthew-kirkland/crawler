import { MongoClient } from 'mongodb';
import Fuse from 'fuse.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
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
 * Writes the newly collected set of events and bet offers to the database
 * @param {Array} events list of events
 * @param {Array} bets list of bets corresponding to event
 * @param {string} bookmakerString unique string representing each bookmaker
 */
export async function writeToData(events, bets, bookmakerString) {
  let eventId;

  for (const i in events) {
    const existingEvent = await eventExists(events[i]);
    if (existingEvent != null) {
      const existingBetIndex = existingEvent.betOffers.findIndex(bet => bet.bookmaker === bookmakerString);
      if (existingBetIndex != -1) {
        existingEvent.betOffers[existingBetIndex] = bets[i]; // update existing bet offer if the bookmaker was there before
      } else {
        existingEvent.betOffers.push(bets[i]); // otherwise add the new bet
      }
      eventId = existingEvent.eventId;
      await db.collection('Sports').updateOne({ eventId: eventId }, { $set: { betOffers: existingEvent.betOffers } });
    } else {
      events[i].betOffers[0] = bets[i];
      eventId = events[i].startTime.toISOString().substring(0, 10) + '-' + events[i].league + '-' + events[i].team1Name + '-' + events[i].team2Name;
      events[i].eventId = eventId;
      await db.collection('Sports').insertOne(events[i]);
    }
  }
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
  const fuse = new Fuse([{ text: str2 }], { keys: ["text"], includeScore: true, threshold: 0.1 });
  const result = fuse.search(str1);
  return result.length > 0;
}

export { db, clients }
