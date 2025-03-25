// import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { unibetEUScraper } from './scrapers/unibet_EU.js';
import { connect, close, clearDb, db } from './database.js';
import { findArbitrageEvents, printSplits } from './utils/arbitrage.js';

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
   * - pointsbet
   * - neds
   * - TAB
   * - tabtouch
   */
  // re-run every hour - gather new games, remove expired games
  await unibetEUScraper();
  console.log('Finished sraping Unibet');

  db.collection('Sports').insertOne({
    eventId: 'thisEventIsGood!!!!',
    startTime: new Date(),
    sport: 'Soccer',
    league: 'EPL',
    team1Name: 'Matthew',
    team2Name: 'Lingge',
    betOffers: [
      {
        bookmaker: 'Ladbrokes',
        bookmakerId: '123',
        link: 'dummyLink',
        team1Odds: 2,
        team2Odds: 3,
        drawOdds: 6.5,
      }
    ],
  });
  const arbEvents = await findArbitrageEvents();
  printSplits(arbEvents);

  await close();

  process.exit(0);
}

main();
