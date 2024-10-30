import puppeteer from 'puppeteer';

export async function ladbrokesScraper(page, url, visitedLinks, queue) {
	try {
		await page.goto(url);
		const sportCard = await page.$('#main #page .sport-event-card');
		if (!sportCard) return;
		
		findUrls(page, visitedLinks, queue);
		const events = await page.evaluate(() => {
			function collectMarket(eventCard) {
				// most likely these are the selectors for any sport event on the ladbrokes desktop site
				const title = eventCard.querySelector('.sports-event-title__name-text');
				const odds = eventCard.querySelectorAll('.price-button-odds-price span');
				const names = eventCard.querySelectorAll('.price-button-name .displayTitle');
				if (names.length == 2) {
					return {
						eventTitle: title.innerText.trim(),
						team1Name: names[0].innerText.trim(),
						team1Odds: odds[0].innerText.trim(),
						team2Name: names[1].innerText.trim(),
						team2Odds: odds[1].innerText.trim(),
					};
				} else if (names.length == 3) {
					return {
						eventTitle: title.innerText.trim(),
						team1Name: names[0].innerText.trim(),
						team1Odds: odds[0].innerText.trim(),
						drawOdds: odds[1].innerText.trim(),
						team2Name: names[2].innerText.trim(),
						team2Odds: odds[2].innerText.trim(),
					};
				} else {
					return 'names length is not 2 or 3';
				}
			}
			const eventsArray = [];
			const eventCards = document.querySelectorAll('#main #page .sport-event-card');
			eventCards.forEach(eventCard => {
        const hasMarket = eventCard.querySelector('.sports-market-primary');
        if (!hasMarket) return;
        const event = collectMarket(eventCard);
        eventsArray.push(event);
			});
			return eventsArray;
		});
		return events;
	} catch (error) {
		console.log('Error fetching page: ', error);
	}
}

async function findUrls(page, visitedLinks, queue) {
	try {
		const visitedLinksArray = Array.from(visitedLinks);
		const pageUrls = await page.evaluate((visitedLinksArray) => {
      function goodUrl(url) {
        const href = url.getAttribute('href');
    
        if (url.href.includes('live')) {
          return false;
        } else if (!href || href == '#' || href == 'javascript:void(0)') {
          return false;
        } else if (url.href.includes('how-to') || url.href.includes('promotions')) {
          return false;
        } else if (!url.href.includes('sports')) {
          // exclude racing for now
          return false;
        } else if (url.href.includes('futures-outrights')) {
          return false;
        }
        return true;
      }

      const urls = [];
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        if (visitedLinksArray.includes(link.href) || !goodUrl(link)) return;
        urls.push(link.href);
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
