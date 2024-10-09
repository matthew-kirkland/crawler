import puppeteer from 'puppeteer';

async function main() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.pitpanda.rocks/players/kanye_fan30');

        await page.waitForSelector('#root #side .Card');

        const leaderboardPositions = await page.evaluate(() => {
            const cards = document.querySelectorAll('#root #side .Card');
            const positions = [];
            cards.forEach(card => {
                const text = card.querySelector('.Card-Head').innerText.trim();
                if (text == 'Leaderboard Positions') {
                    const spans = card.querySelectorAll('.Card-Body div span.MinecraftText.undefined');
                    spans.forEach(span => {
                        const positionSpan = span.querySelector('span:nth-child(2)');
                        if (positionSpan) {
                            const rawText = positionSpan.innerText.trim();
                            const position = parseInt(rawText.replace(/[^0-9]/g, ''));
                            if (!isNaN(position)) {
                                positions.push(position);
                            }
                        }
                    });
                }
            });
            return positions;
        });

        console.log(`Leaderboard positions are: ${leaderboardPositions}`);
        let sum = 0;
        for (let i = 0; i < leaderboardPositions.length; i++) {
            sum += leaderboardPositions[i];
        }
        console.log(`The average of the leaderboard positions is: ${sum / leaderboardPositions.length}`);

        await browser.close();
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}

main();