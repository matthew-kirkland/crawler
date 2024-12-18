import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { Queue } from './utils/Queue.js';
import { save, load, clear } from './datastore.js';
import { connect, close } from './database.js';
import puppeteer from 'puppeteer';

async function main() {
  const database = await connect();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // VIEWPORT IS THE THING INFLUENCING MOBILE VS DESKTOP VERSION !!!!!!!!!!!!!!!!
  await page.setViewport({
    width: 1280,
    height: 800
  });
  const visitedLinks = new Set;
  const ladbrokesQueue = new Queue;

  ladbrokesQueue.enqueue('https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
  while (!ladbrokesQueue.isEmpty()) {
    const nextUrl = ladbrokesQueue.dequeue();
    if (visitedLinks.has(nextUrl)) continue;
    console.log(`VISITING LINK ${nextUrl}`);
    visitedLinks.add(nextUrl);
    const ret = await ladbrokesScraper(page, nextUrl, visitedLinks, ladbrokesQueue, database);
    if (ret === null) {
      console.log(`NOT THE RIGHT PAGE FOR MARKETS`);
    }
  }
  await browser.close();
  await close();
}

main();