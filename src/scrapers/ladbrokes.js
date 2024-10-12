import puppeteer from 'puppeteer';

export async function ladbrokesScraper(page, url) {
    try {
        await page.goto(url);
        console.log('Page loaded');
        // most likely this is the selector for any sport event on ladbrokes
        await page.waitForSelector('#app #main #page .page-content-inner .sport-event-card');
        console.log('Selector found');
        const events = await page.evaluate(() => {
            const eventsArray = [];
            const eventCards = document.querySelectorAll('#main .sport-event-card');
            eventCards.forEach(eventCard => {
                console.log('Event card found');
                const title = eventCard.querySelector('.sports-event-title__name-text').innerText.trim();
                const odds = eventCard.querySelectorAll('.price-button-odds-price span');
                const names = eventCard.querySelectorAll('.price-button-name span');
                eventsArray.push({
                    eventTitle: title,
                    team1Name: names[0].innerText,
                    team1Odds: odds[0].innerText,
                    drawOdds: odds[1].innerText,
                    team2Name: names[1].innerText,
                    team2Odds: odds[2].innerText,
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