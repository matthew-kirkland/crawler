import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { Queue } from './utils/Queue.js';
import { connect, close } from './database.js';
import axios from 'axios';

async function main() {
  const database = await connect();
  const visitedLinks = new Set;
  const ladbrokesQueue = new Queue;
  // split into one thread per bookmaker, keep queues in each thread
  /** e.g
   * ladbrokesScraper()
   * sportsbetScraper()
   * unibetScraper()
   * ...
   * each one locally connects and writes to the database (already atomic)
   */
  
  // re-run every hour - gather new games, ignore existing games, remove expired games
  
  ladbrokesQueue.enqueue('https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
  while (!ladbrokesQueue.isEmpty()) {
    const nextUrl = ladbrokesQueue.dequeue();
    if (visitedLinks.has(nextUrl)) continue;
    console.log(`VISITING LINK ${nextUrl}`);
    visitedLinks.add(nextUrl);
    const ret = await ladbrokesScraper(page, nextUrl, visitedLinks, ladbrokesQueue, database);
    if (ret === null) {
      console.log(`NOT THE RIGHT PAGE FOR MARKETS`);
    }
  }
  await close();
}

main();