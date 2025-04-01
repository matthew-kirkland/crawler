import { db, eventExists } from '../database.js';
import axios from 'axios';

const bookmakerString = 'TABtouch';

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
 * Main scraping function for the TABtouch bookmaker
 */
export async function TABtouchScraper() {
  const events = [];
  const bets = [];
  let url, res;
  for (const sport of sports) {
    url = `https://oc-offering-api.kambicdn.com/offering/v2018/rwwawa/listView/${sport}.json?channel_id=3&client_id=2&lang=en_AU&market=AU&useCombined=true`;
    res = await axios.get(url);
    if (res.status != 200) continue;
    for (const event of res.data.events) {
      if (event.event.state == 'STARTED') continue;

      try {
        url = `https://oc-offering-api.kambicdn.com/offering/v2018/rwwawa/betoffer/event/${event.event.id}.json?lang=en_AU&market=AU&client_id=2&channel_id=3&ncid=1743512859871&includeParticipants=true&range_size=1`
        res = await axios.get(url);
        if (res.status != 200) continue;
        const offers = res.data.betOffers;
        const resultBet = offers.find(offer => offer.betOfferType.id == 2);
        if (!resultBet) continue;

        if (resultBet.outcomes.length == 2) {
          bets.push({
            bookmaker: bookmakerString,
            bookmakerId: event.event.id,
            link: `https://www.tabtouch.mobi/tabtouch-sports/event/${event.event.id}`,
            team1Odds: resultBet.outcomes[0].odds / 1000,
            team2Odds: resultBet.outcomes[1].odds / 1000,
          });
        } else {
          bets.push({
            bookmaker: bookmakerString,
            bookmakerId: event.event.id,
            link: `https://www.tabtouch.mobi/tabtouch-sports/event/${event.event.id}`,
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
export async function writeToData(events, bets) {
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