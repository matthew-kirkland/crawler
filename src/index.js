// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetEUScraper } from './scrapers/unibet_EU.js';
import { TABtouchScraper } from './scrapers/TABtouch.js';
import { unibetAUScraper } from './scrapers/unibet_AU.js';
import { connect, close, clearDb, db, clearOldEvents } from './database.js';
import { findArbitrageEvents } from './utils/arbitrage.js';

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
   */
  // re-run every hour - gather new games, remove expired games
  console.log(`Time before starting: ${new Date()}`);
  await unibetEUScraper();
  console.log(`Time after finishing unibetEU: ${new Date()}`);
  await TABtouchScraper();
  console.log(`Time after finishing TABtouch: ${new Date()}`);
  await unibetAUScraper();
  console.log(`Time after finishing unibetAU: ${new Date()}`);
  console.log(`Time after finishing all: ${new Date()}`);

  // await db.collection('Sports').insertOne({
  //   eventId: 'thisEventIsGood!!!!',
  //   startTime: new Date(),
  //   sport: 'Soccer',
  //   league: 'EPL',
  //   team1Name: 'Matthew',
  //   team2Name: 'Lingge',
  //   betOffers: [
  //     {
  //       bookmaker: 'dummyBookmaker',
  //       bookmakerId: '123',
  //       link: 'https://www.wikipedia.org/',
  //       team1Odds: 2,
  //       team2Odds: 3,
  //       drawOdds: 10,
  //     }
  //   ],
  // });
  setTimeout(async () => {
    await findArbitrageEvents();
    console.log(`Time after scanning for arbitrage: ${new Date()}`);
    await close();
    process.exit(0);
  }, 2000);
}

main();
