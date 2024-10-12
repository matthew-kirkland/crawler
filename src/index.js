import { pitpandaScraper } from './scrapers/pitpanda.js';

async function main() {
    const leaderboardPositions = await pitpandaScraper('https://www.pitpanda.rocks/players/kanye_fan30');
    console.log(`Leaderboard positions are: ${leaderboardPositions}`);
    let sum = 0;
    for (let i = 0; i < leaderboardPositions.length; i++) {
        sum += leaderboardPositions[i];
    }
    console.log(`The average of the leaderboard positions is: ${sum / leaderboardPositions.length}`);
}

main();