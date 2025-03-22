// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetScraper } from './scrapers/unibet.js';
import { connect, close, clearDb } from './database.js';

/**
 * The starting point for all scrapers
 */
async function main() {
  await connect();
  await clearDb();
  // split into one thread per bookmaker, keep queues in each thread
  /** e.g
   * ladbrokesScraper()
   * sportsbetScraper()
   * unibetScraper()
   * ...
   * each one locally writes to the database (already atomic)
   */
  // re-run every hour - gather new games, remove expired games
  await unibetScraper();
  console.log('Finished sraping Unibet');

  await close();

  process.exit(0);
}

main();
