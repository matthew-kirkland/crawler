import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { pitpandaScraper } from './scrapers/pitpanda.js';
import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // VIEWPORT IS THE THING INFLUENCING MOBILE OR DESKTOP VERSION !!!!!!!!!!!!!!!!
    await page.setViewport({
        width: 1280,
        height: 800
    });
    const events = await ladbrokesScraper(page, 'https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
    for (const event of events) {
        console.log(`Event: ${event.eventTitle}`);
        console.log(`Team 1: ${event.team1Name} - ${event.team1Odds}`);
        console.log(`Draw: ${event.drawOdds}`);
        console.log(`Team 2: ${event.team2Name} - ${event.team2Odds}`);
    }
    await browser.close();
}

main();