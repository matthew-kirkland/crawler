import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { Queue } from './utils/Queue.js';
import { save, load, clear } from './datastore.js';
import puppeteer from 'puppeteer';

async function main() {
  clear();
  load();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // VIEWPORT IS THE THING INFLUENCING MOBILE OR DESKTOP VERSION !!!!!!!!!!!!!!!!
  await page.setViewport({
    width: 1280,
    height: 800
  });
  const visitedLinks = new Set;
  const ladbrokesQueue = new Queue;

  ladbrokesQueue.enqueue('https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
  // for testing data persistence the counter exists
  let counter = 0;
  while (!ladbrokesQueue.isEmpty()) {
    const nextUrl = ladbrokesQueue.dequeue();
    if (visitedLinks.has(nextUrl)) continue;
    console.log(`VISITING LINK ${nextUrl}`);
    visitedLinks.add(nextUrl);
    const ret = await ladbrokesScraper(page, nextUrl, visitedLinks, ladbrokesQueue);
    if (ret === null) {
      console.log(`NOT THE RIGHT PAGE FOR MARKETS`);
    }
    counter++;
  }
  save();
  await browser.close();
}

main();