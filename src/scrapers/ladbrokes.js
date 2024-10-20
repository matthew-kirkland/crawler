import puppeteer from 'puppeteer';

export async function ladbrokesScraper(page, url, visitedLinks, queue) {
    try {
        await page.goto(url);
        // most likely these are the selectors for any sport event on the ladbrokes desktop site
        await page.waitForSelector('#app #main #page .sport-event-card');
        await page.waitForSelector('.sports-event-title__name-text');
        await page.waitForSelector('.price-button-odds-price span');
        await page.waitForSelector('.price-button-name span');
        await page.waitForSelector('a');
        ladbrokesCrawler(page, visitedLinks, queue);
        const events = await page.evaluate(() => {
            const eventsArray = [];
            const eventCards = document.querySelectorAll('#main #page .sport-event-card');
            eventCards.forEach(eventCard => {
                const hasMarket = eventCard.querySelector('.sports-market-primary');
                if (!hasMarket) return;

                const title = eventCard.querySelector('.sports-event-title__name-text');
                const odds = eventCard.querySelectorAll('.price-button-odds-price span');
                const names = eventCard.querySelectorAll('.price-button-name span');
                eventsArray.push({
                    eventTitle: title.innerText.trim(),
                    team1Name: names[0].innerText.trim(),
                    team1Odds: odds[0].innerText.trim(),
                    drawOdds: odds[1].innerText.trim(),
                    team2Name: names[2].innerText.trim(),
                    team2Odds: odds[2].innerText.trim(),
                });
            });
            return eventsArray;
        });
        return events;
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}

async function ladbrokesCrawler(page, visitedLinks, queue) {
    try {
        const visitedLinksArray = Array.from(visitedLinks);
        const pageUrls = await page.evaluate((visitedLinksArray) => {
            const urls = [];
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                if (visitedLinksArray.includes(link.href)) return;

                const href = link.getAttribute('href');
                if (!href || href == '#' || href == 'javascript:void(0)') return;

                if (link.href.includes('sports')) {
                    urls.push(link.href);
                }
            });
            return urls;
        }, visitedLinksArray);
        pageUrls.forEach(url => {
            queue.enqueue(url);
        });
    } catch (error) {
        console.log(error);
    }
}