import { Calculator } from './Calculator.js';
import { db } from '../database.js';

const defaultTotal = 100;

/**
 * Searches the database for arbitrage events
 * @returns {array} set of events with arbitrage opportunities
 */
export async function findArbitrageEvents() {
  const events = await db.collection('Sports').find({ }).toArray();
  const arbitrageEvents = [];
  let maxInfo;

  for (const event of events) {
    maxInfo = {
      eventId: '',
      team1Odds: 0,
      team2Odds: 0,
      drawOdds: 0,
      team1Bookmaker: '',
      team1Link: '',
      team2Bookmaker: '',
      team2Link: '',
      drawBookmaker: '',
      drawLink: '',
    }
    maxInfo.eventId = event.eventId;
    for (const offer of event.betOffers) {
      if (offer.drawOdds) {
        if (offer.drawOdds > maxInfo.drawOdds) {
          maxInfo.drawOdds = offer.drawOdds;
          maxInfo.drawBookmaker = offer.bookmaker;
          maxInfo.drawLink = offer.link;
        }
      }
      if (offer.team1Odds > maxInfo.team1Odds) {
        maxInfo.team1Odds = offer.team1Odds;
        maxInfo.team1Bookmaker = offer.bookmaker;
        maxInfo.team1Link = offer.link;
      }
      if (offer.team2Odds > maxInfo.team2Odds) {
        maxInfo.team2Odds = offer.team2Odds;
        maxInfo.team2Bookmaker = offer.bookmaker;
        maxInfo.team2Link = offer.link;
      }
    }

    if (event.betOffers[0].drawOdds) {
      if (Calculator.hasArb_3bet(maxInfo.team1Odds, maxInfo.team2Odds, maxInfo.drawOdds)) {
        arbitrageEvents.push(maxInfo);
      }
    } else {
      if (Calculator.hasArb_2bet(maxInfo.team1Odds, maxInfo.team2Odds)) {
        arbitrageEvents.push(maxInfo);
      }
    }
  }
  return arbitrageEvents;
}

/**
 * Prints out the events and how money should be split between them
 * @param {array} arbitrageEvents set of events with arbitrage opportunities
 * @returns
 */
export function printSplits(arbitrageEvents) {
  for (const event of arbitrageEvents) {
    let moneySplit;
    if (event.drawOdds) {
      moneySplit = Calculator.splitMoney_3bet(defaultTotal, event.team1Odds, event.team2Odds, event.drawOdds);
    } else {
      moneySplit = Calculator.splitMoney_2bet(defaultTotal, event.team1Odds, event.team2Odds);
    }
    if (!moneySplit) {
      console.log(`No valid split for event ${event.eventId}`);
      return;
    }
    
    console.log(`\nEvent: ${event.eventId}`);
    if (event.drawOdds) {
      console.log(`Expected profit: ${(100 * Calculator.expectedProfit_3bet(event.team1Odds, event.team2Odds, event.drawOdds)).toFixed(2)}%`);
    } else {
      console.log(`Expected profit: ${(100 * Calculator.expectedProfit_2bet(event.team1Odds, event.team2Odds)).toFixed(2)}%`);
    }
    console.log(`Team 1: ${event.team1Bookmaker}, access at ${event.team1Link} for odds of ${event.team1Odds}`);
    console.log(`Should place ${moneySplit.money1} into this team\n`);
    console.log(`Team 2: ${event.team2Bookmaker}, access at ${event.team2Link} for odds of ${event.team2Odds}`);
    console.log(`Should place ${moneySplit.money2} into this team\n`);
    if (event.drawOdds) {
      console.log(`Draw: ${event.drawBookmaker}, access at ${event.drawLink} for odds of ${event.drawOdds}`);
      console.log(`Should place ${moneySplit.money3} into this team\n`);
    }
    console.log('==============================================================================');
  }
}
