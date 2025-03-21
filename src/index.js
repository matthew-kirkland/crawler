// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetScraper } from './scrapers/unibet.js';
import { connect, close } from './database.js';

async function main() {
  await connect();
  // split into one thread per bookmaker, keep queues in each thread
  /** e.g
   * ladbrokesScraper()
   * sportsbetScraper()
   * unibetScraper()
   * ...
   * each one locally connects and writes to the database (already atomic)
   */
  // re-run every hour - gather new games, remove expired games
  await unibetScraper();

  await close();
}

main();
