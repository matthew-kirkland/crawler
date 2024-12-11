import { MongoClient } from 'mongodb';
import { eventExists } from './utils/other.js';

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

export async function writeToData(events, database, sport) {
  const sportDocument = await database.collection("Sports").findOne({ sport: sport });
  const documentEvents = sportDocument.data;

  for (const event of events) {
    const title = event.team1Name.toLowerCase() + ' - ' + event.team2Name.toLowerCase();
    // add the date here later
    const existingEvent = eventExists(title, documentEvents);
    if (existingEvent != null) {
      await database.collection("Sports").updateOne(
        { sport: sport, "data.eventTitle": existingEvent.eventTitle },
        { $push: { "data.$.markets": event } }
      );
    } else {
      const newEvent = {
        eventTitle: title,
        markets: [event],
      };
      await database.collection("Sports").updateOne(
        { sport: sport },
        { $push: { data: newEvent } }
      );
    }
  }
}