import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { Queue } from './utils/Queue.js';
import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // VIEWPORT IS THE THING INFLUENCING MOBILE OR DESKTOP VERSION !!!!!!!!!!!!!!!!
  await page.setViewport({
    width: 1280,
    height: 800
  });
  const visitedLinks = new Set;
  const ladbrokesQueue = new Queue;

  visitedLinks.add('https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
  ladbrokesQueue.enqueue('https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
  while (!ladbrokesQueue.isEmpty()) {
    const nextUrl = ladbrokesQueue.dequeue();
    console.log(`VISITING LINK ${nextUrl}`);
    visitedLinks.add(nextUrl);
    const events = await ladbrokesScraper(page, nextUrl, visitedLinks, ladbrokesQueue);
    try {
      if (!events) continue;
      for (const event of events) {
        if (event.eventTitle) {
          console.log('Event:', event.eventTitle);
        }
        console.log(`Team 1: ${event.team1Name} - ${event.team1Odds}`);
        if (event.drawOdds) {
          console.log(`Draw: ${event.drawOdds}`);
        }
        console.log(`Team 2: ${event.team2Name} - ${event.team2Odds}`);
      }
    } catch (error) {
      console.error('Error processing events:', error);
    }
  }
  await browser.close();
}

main();