// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetEUScraper } from './scrapers/unibet_EU.js';
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
   * 
   * bookmakers to consider:
   * - betfair sportsbook
   * - ladbrokes
   * - sportsbet
   * - coral
   * - TAB
   * - neds
   */
  // re-run every hour - gather new games, remove expired games
  await unibetEUScraper();
  console.log('Finished sraping Unibet');

  await close();

  process.exit(0);
}

main();
