import puppeteer from 'puppeteer';

export async function pitpandaScraper(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

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

        await browser.close();
        return leaderboardPositions;
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}