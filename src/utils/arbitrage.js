import { Calculator } from './Calculator.js';
import { db } from '../database.js';
import { sendNotif } from '../discord/bot.js';

const defaultTotal = 100;

/**
 * Searches the database for arbitrage events
 */
export async function findArbitrageEvents() {
  const events = await db.collection('Sports').find({ }).toArray();
  let maxInfo;

  for (const event of events) {
    maxInfo = {
      eventId: '',
      team1Odds: 0,
      team2Odds: 0,
      drawOdds: 0,
      team1Name: '',
      team1Bookmaker: '',
      team1Link: '',
      team2Name: '',
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
        maxInfo.team1Name = event.team1Name;
        maxInfo.team1Bookmaker = offer.bookmaker;
        maxInfo.team1Link = offer.link;
      }
      if (offer.team2Odds > maxInfo.team2Odds) {
        maxInfo.team2Odds = offer.team2Odds;
        maxInfo.team2Name = event.team2Name;
        maxInfo.team2Bookmaker = offer.bookmaker;
        maxInfo.team2Link = offer.link;
      }
    }

    if (event.betOffers[0].drawOdds) {
      if (Calculator.hasArb_3bet(maxInfo.team1Odds, maxInfo.team2Odds, maxInfo.drawOdds)) {
        triggerBot(maxInfo);
      }
    } else {
      if (Calculator.hasArb_2bet(maxInfo.team1Odds, maxInfo.team2Odds)) {
        triggerBot(maxInfo);
      }
    }
  }
}

/**
 * Triggers the discord bot to send a formatted message detailing the arbitrage event
 * @param {object} event the arbitrage event
 * @returns
 */
export function triggerBot(event) {
  const message = createMessage(event);
  if (!message) return;
  sendNotif(message);
}

/**
 * Generates an arbitrage notification message to be sent 
 * @param {object} event the arbitrage event
 * @returns {string} the formatted message
 */
export function createMessage(event) {
  let moneySplit;
  if (event.drawOdds) {
    moneySplit = Calculator.splitMoney_3bet(defaultTotal, event.team1Odds, event.team2Odds, event.drawOdds);
  } else {
    moneySplit = Calculator.splitMoney_2bet(defaultTotal, event.team1Odds, event.team2Odds);
  }
  if (!moneySplit) {
    console.log(`No valid split for event ${event.eventId}`);
    return null;
  }

  const title = `Event: ${event.eventId}`;
  let profitMsg;
  if (event.drawOdds) {
    profitMsg = `Expected profit: ${(100 * Calculator.expectedProfit_3bet(event.team1Odds, event.team2Odds, event.drawOdds)).toFixed(2)}%`;
  } else {
    profitMsg = `Expected profit: ${(100 * Calculator.expectedProfit_2bet(event.team1Odds, event.team2Odds)).toFixed(2)}%`;
  }

  const teamSplitMsg = `Team 1: Place a bet on ${event.team1Name}
  Go to ${event.team1Bookmaker}, access at ${event.team1Link} for odds of ${event.team1Odds}
  Should place $${moneySplit.money1} into this team

  Team 2: Place a bet on ${event.team2Name}
  Go to ${event.team2Bookmaker}, access at ${event.team2Link} for odds of ${event.team2Odds}
  Should place $${moneySplit.money2} into this team`;

  let drawSplitMsg = '';
  if (event.drawOdds) {
    drawSplitMsg += `Draw: Place a bet on the draw
    Go to ${event.drawBookmaker}, access at ${event.drawLink} for odds of ${event.drawOdds}
    Should place $${moneySplit.money3} into this team`;
  }

  const message = title + '\n' + profitMsg + '\n\n' + teamSplitMsg + '\n\n' + drawSplitMsg;
  return message;
}
