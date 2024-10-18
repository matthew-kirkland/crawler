import puppeteer from 'puppeteer';

export async function ladbrokesScraper(page, url) {
    try {
        await page.goto(url);
        console.log('Page loaded');
        // most likely this is the selector for any sport event on ladbrokes
        // await page.waitForSelector('#app #main #page .sport-event-card', {timeout: 300000});
        await page.waitForSelector('#app #main #page .sports-event-entry-with-markets', {timeout: 300000});
        console.log('Selector found');
        const events = await page.evaluate(() => {
            const eventsArray = [];
            const eventCards = document.querySelectorAll('#main #page .sports-event-entry-with-markets');
            console.log(`eventcards: ${eventCards}`);
            eventCards.forEach(eventCard => {
                console.log('Event card found');
                const title = eventCard.querySelector('.sports-event-subtitle__name-text').innerText.trim();
                const odds = eventCard.querySelectorAll('.price-button-odds-price span');
                const names = eventCard.querySelectorAll('.price-button-name span');
                eventsArray.push({
                    eventTitle: title,
                    team1Name: names[0].innerText.trim(),
                    team1Odds: odds[0].innerText.trim(),
                    drawOdds: odds[1].innerText.trim(),
                    team2Name: names[2].innerText.trim(),
                    team2Odds: odds[2].innerText.trim(),
                });
                console.log('Event added');
            });
            return eventsArray;
        });
        return events;
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}