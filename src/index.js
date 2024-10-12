import { ladbrokesScraper } from './scrapers/ladbrokes.js';
import { pitpandaScraper } from './scrapers/pitpanda.js';
import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // const leaderboardPositions = await pitpandaScraper(page, 'https://www.pitpanda.rocks/players/kanye_fan30');
    // console.log(`Leaderboard positions are: ${leaderboardPositions}`);
    // let sum = 0;
    // for (let i = 0; i < leaderboardPositions.length; i++) {
    //     sum += leaderboardPositions[i];
    // }
    // console.log(`The average of the leaderboard positions is: ${sum / leaderboardPositions.length}`);
    const events = await ladbrokesScraper(page, 'https://www.ladbrokes.com.au/sports/soccer/uk-ireland/premier-league');
    console.log(events);
    await browser.close();
}

main();