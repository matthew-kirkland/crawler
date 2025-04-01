// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetEUScraper } from './scrapers/unibet_EU.js';
import { TABtouchScraper } from './scrapers/TABtouch.js';
import { unibetAUScraper } from './scrapers/unibet_AU.js';
import { connect, close, clearDb, db, clearOldEvents } from './database.js';
import { findArbitrageEvents, printSplits } from './utils/arbitrage.js';

/**
 * The starting point for all scrapers
 */
async function main() {
  await connect();
  await clearDb();
  await clearOldEvents();
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
   * - pointsbet
   * - neds
   * - TAB
   * - tabtouch
   */
  // re-run every hour - gather new games, remove expired games
  await unibetEUScraper();
  console.log('Finished sraping Unibet EU');
  await TABtouchScraper();
  console.log('Finished sraping TABtouch');
  await unibetAUScraper();
  console.log('Finished scraping Unibet AU');

  // db.collection('Sports').insertOne({
  //   eventId: 'thisEventIsGood!!!!',
  //   startTime: new Date(),
  //   sport: 'Soccer',
  //   league: 'EPL',
  //   team1Name: 'Matthew',
  //   team2Name: 'Lingge',
  //   betOffers: [
  //     {
  //       bookmaker: 'Ladbrokes',
  //       bookmakerId: '123',
  //       link: 'dummyLink',
  //       team1Odds: 2,
  //       team2Odds: 3,
  //       drawOdds: 10,
  //     }
  //   ],
  // });
  const arbEvents = await findArbitrageEvents();
  printSplits(arbEvents);

  await close();

  process.exit(0);
}

main();
