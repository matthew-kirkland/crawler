import { db } from 'mongodb';
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

export async function unibetScraper() {  
  const events = [];
  let url, res;
  for (const sport of sports) {
    url = `https://eu-offering-api.kambicdn.com/offering/v2018/ubca/listView/${sport}.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1`;
    res = await axios.get(url);
    if (res.status != 200) continue;
    for (const event of res.data.events) {
      if (event.event.state == 'STARTED') continue;

      url = `https://eu-offering-api.kambicdn.com/offering/v2018/ubca/betoffer/event/${event.id}.json?lang=en_GB&market=ZZ&client_id=2&channel_id=1&includeParticipants=true`;
      res = await axios.get(url);
      const offers = res.data.betOffers;
      const resultBet = offers.find(offer => offer.betOfferType.id == 2);
      if (!resultBet) continue;
      // console.log(`full time result found for event ${event.id} in ${event.sport}`);

      const bets = [];
      if (resultBet.outcomes.length == 2) {
        bets.push({
          bookmaker: 'Unibet',
          bookmakerId: event.bookmakerId,
          link: `https://www.unibet.com/betting/sports/event/${event.bookmakerId}`,
          team1Odds: resultBet.outcomes[0].odds / 1000,
          team2Odds: resultBet.outcomes[1].odds / 1000,
        });
      } else {
        bets.push({
          bookmaker: 'Unibet',
          bookmakerId: event.bookmakerId,
          link: `https://www.unibet.com/betting/sports/event/${event.bookmakerId}`,
          team1Odds: resultBet.outcomes[0].odds / 1000,
          drawOdds: resultBet.outcomes[1].odds / 1000,
          team2Odds: resultBet.outcomes[2].odds / 1000,
        });
      }
      events.push({
        eventId: 0,
        startTime: new Date(event.event.start),
        sport: sport,
        league: event.event.group,
        team1Name: event.event.homeName,
        team2Name: event.event.team2Name,
        betOffers: [],
      });
    }
  }

  writeToData(events, bets);
}

async function writeToData(events, bets) {
  let eventId;

  for (const i in events) {
    const existingEvent = eventExists(events[i]);
    if (existingEvent) {
      const existingBetIndex = existingEvent.betOffers.findIndex(bet => bet.bookmaker === "Unibet");
      if (existingBetIndex != -1) {
        existingEvent.betOffers[existingBetIndex] = bets[i]; // update existing bet offer if the bookmaker was there before
        eventId = existingEvent.eventId;
      } else {
        existingEvent.betOffers.push(bets[i]); // otherwise add the new bet
        eventId = events[i].startTime.toString().substring(0, 11) + '-' + events[i].league + '-' + events[i].team1Name + '-' + events[i].team2Name;
      }
      await db.collection('Sports').updateOne({ eventId: eventId }, { $set: { bets: existingEvent.betOffers } });
    } else {
      events[i].betOffers[0] = bets[i];
      await db.collection('Sports').insertOne(events[i]);
    }
  }
}
