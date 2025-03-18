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
 * Connects to the cloud database
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
 * Disconnects from the cloud database
 */
export async function close() {
  await client.close();
  console.log("MongoDB connection closed");
}

/**
 * Writes the new events to a particular document of the database
 * @param {Array} events array of new events
 * @param {MongoDB} database the database to write to
 * @param {String} sport the sport that the events belong to
 */
export async function writeToData(events, database, sport) {
  let sportDocument = await database.collection('Sports').findOne({ sport: sport });
  if (sportDocument === null) {
    const newObj = await database.collection('Sports').insertOne({ sport: sport, data: []});
    sportDocument = await database.collection('Sports').findOne({ _id: newObj.insertedId });
  }
  const documentEvents = sportDocument.data;

  for (const event of events) {
    const title = event.team1Name.toLowerCase() + ' - ' + event.team2Name.toLowerCase();
    // add the date here later
    const existingEvent = eventExists(title, documentEvents);
    if (existingEvent != null) {
      if (existingEvent.markets.some(market => market.website === event.website)) continue;
      await database.collection('Sports').updateOne(
        { sport: sport, "data.eventTitle": existingEvent.eventTitle },
        { $push: { "data.$.markets": event } }
      );
    } else {
      const newEvent = {
        eventTitle: title,
        markets: [event],
      };
      await database.collection('Sports').updateOne(
        { sport: sport },
        { $push: { data: newEvent } }
      );
    }
  }
}
