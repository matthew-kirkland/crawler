import { db, eventExists } from '../database.js';
import axios from 'axios';

/**
 * 1. Find event ID's
 * 2. Request the markets API for each event ID
 * 3. Find the bet with criterion.label == "Full Time"
 * 4. Write to database:
 *    a) Check if event already exists (check start date/time, fuzzy team names). If so, put new odds offers into the event data in mongodb.
 *      i) If the bookmaker already exists, overwrite the existing odds.
 *      ii) Otherwise add as a new bookmaker. For unibet, the link is unibet.com/betting/sports/event/${eventID}
 *    b) Otherwise, create new event ID: YYYY-MM-DD-HHMM-team1Name-team2Name and initialise event data with these new odds. Also, write this new event into the SQL table.
 *       Include event ID, start time, sport, team1Name, team2Name
 * {
 *    bookmakerId: int
 *    startTime: ISO time,
 *    sport: string,
 *    league: string,
 *    team1Name: string,
 *    team2Name: string,
 *    betOffers: [],
 * }
 */
const bookmakerString = 'Unibet EU';

const sports = [
  'american_football',
  'australian_rules',
  'baseball',
  'basketball', // some basketball has no match result (NCAAW)
  'bowling',
  'boxing',
  'cricket',
  'curling',
  // 'cycling', select the singular winner
  'darts',
  'esports',
  'floorball',
  'football',
  // 'formula_1', select the singular winner
  'gaelic_sports',
  // 'golf', select the singular winner
  'handball',
  'ice_hockey',
  // 'lacrosse', select winner of the league
  // 'motorsports', select the singular winner
  // 'netball', pretty much no markets
  'rugby_league',
  'rugby_union',
  'snooker',
  'softball',
  'surfing',
  'table_tennis',
  // 'trotting', pretty much no markets
  'ufc_mma',
  'volleyball',
  'water_polo'
];

/**
 * Main scraping function for the Unibet bookmaker
 */
export async function unibetEUScraper() {  
  const events = [];
  const bets = [];
  let url, res;
  for (const sport of sports) {
    url = `https://eu-offering-api.kambicdn.com/offering/v2018/ubca/listView/${sport}.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1`;
    res = await axios.get(url);
    if (res.status != 200) continue;
    for (const event of res.data.events) {
      if (event.event.state == 'STARTED') continue;

      try {
        url = `https://eu-offering-api.kambicdn.com/offering/v2018/ubca/betoffer/event/${event.event.id}.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1&includeParticipants=true`;
        res = await axios.get(url);
        if (res.status != 200) continue;
        const offers = res.data.betOffers;
        const resultBet = offers.find(offer => offer.betOfferType.id == 2);
        if (!resultBet) continue;

        if (resultBet.outcomes.length == 2) {
          bets.push({
            bookmaker: bookmakerString,
            bookmakerId: event.event.id,
            link: `https://www.unibet.com/betting/sports/event/${event.event.id}`,
            team1Odds: resultBet.outcomes[0].odds / 1000,
            team2Odds: resultBet.outcomes[1].odds / 1000,
          });
        } else {
          bets.push({
            bookmaker: bookmakerString,
            bookmakerId: event.event.id,
            link: `https://www.unibet.com/betting/sports/event/${event.event.id}`,
            team1Odds: resultBet.outcomes[0].odds / 1000,
            team2Odds: resultBet.outcomes[2].odds / 1000,
            drawOdds: resultBet.outcomes[1].odds / 1000,
          });
        }
        events.push({
          eventId: 0,
          startTime: new Date(event.event.start),
          sport: sport,
          league: event.event.group,
          team1Name: event.event.homeName,
          team2Name: event.event.awayName,
          betOffers: [],
        });
      } catch {
        console.log(`Error gathering event data for ${event.event.id} in ${sport}`);
      }
    }
  }

  await writeToData(events, bets);
}

/**
 * Writes the newly collected set of events and bet offers to the database
 * @param {Array} events 
 * @param {Array} bets 
 */
async function writeToData(events, bets) {
  let eventId;

  for (const i in events) {
    const existingEvent = await eventExists(events[i]);
    if (existingEvent != null) {
      const existingBetIndex = existingEvent.betOffers.findIndex(bet => bet.bookmaker === bookmakerString);
      if (existingBetIndex != -1) {
        existingEvent.betOffers[existingBetIndex] = bets[i]; // update existing bet offer if the bookmaker was there before
      } else {
        existingEvent.betOffers.push(bets[i]); // otherwise add the new bet
      }
      eventId = existingEvent.eventId;
      await db.collection('Sports').updateOne({ eventId: eventId }, { $set: { betOffers: existingEvent.betOffers } });
    } else {
      events[i].betOffers[0] = bets[i];
      eventId = events[i].startTime.toISOString().substring(0, 10) + '-' + events[i].league + '-' + events[i].team1Name + '-' + events[i].team2Name;
      events[i].eventId = eventId;
      await db.collection('Sports').insertOne(events[i]);
    }
  }
}
