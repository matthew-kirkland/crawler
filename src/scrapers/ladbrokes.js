import puppeteer from 'puppeteer';
import { data } from '../datastore.js';
import { eventExists } from '../utils/other.js';
import { Queue } from '../utils/Queue.js';

/**
 * The main web scraper for the Ladbrokes website
 * @param {page} page the puppeteer page object
 * @param {String} url url currently being visited
 * @param {Set} visitedLinks set of urls already visited
 * @param {Queue} queue queue of urls to visit
 * @returns 
 */
export async function ladbrokesScraper(page, url, visitedLinks, queue) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const sportCard = await page.$('#main #page .sport-event-card');
    if (!sportCard) return null;

    const filterPage = await page.$('#main #page .matches-filter');
    if (filterPage) {
      console.log('QUEUEING FILTERS');
      await queueFilters(page, queue);
      return null;
    }
    
    findUrls(page, visitedLinks, queue);
    const events = await page.evaluate(() => {
      function collectMarket(eventCard) {
        // most likely these are the selectors for any sport event on the ladbrokes desktop site
        const title = eventCard.querySelector('.sports-event-title__name-text');
        const odds = eventCard.querySelectorAll('.price-button-odds-price span');
        const names = eventCard.querySelectorAll('.price-button-name .displayTitle');

        const eventTitle = title.innerText.trim();
        const team1Name = names[0]?.innerText.trim();
        const team1Odds = odds[0]?.innerText.trim();
        const team2Name = names[names.length - 1]?.innerText.trim();
        const team2Odds = odds[odds.length - 1]?.innerText.trim();
        const drawOdds = names.length === 3 ? odds[1]?.innerText.trim() : undefined;
        return {
          eventTitle,
          team1Name,
          team1Odds,
          team2Name,
          team2Odds,
          ...(drawOdds && { drawOdds })
        };
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
    writeToData(url, events);
  } catch (error) {
    console.error('Error fetching page: ', error);
  }
}

/**
 * Searches for all filter elements on the page and adds their url to the queue
 * @param {page} page puppeteer page object
 * @param {Queue} queue queue of urls to visit
 */
async function queueFilters(page, queue) {
  const filterUrls = await page.evaluate(() => {
    const urls = [];
    const filters = document.querySelectorAll('#main #page .matches-filter a');
    filters.forEach(filter => {
      urls.push(filter.href);
    });
    return urls;
  });
  for (const url of filterUrls) {
    queue.enqueue(url);
  }
}

/**
 * Finds all desirable links on the page and adds it to the queue
 * @param {page} page puppeteer page object
 * @param {Set} visitedLinks set of urls already visited
 * @param {Queue} queue queue of urls to visit
 */
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
        } else if (url.href.includes('any-team-vs-any-team') || url.href.includes('#round')) {
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
    console.error(error);
  }
}

/**
 * Retrieves the sport of the current page from the url
 * @param {String} url 
 * @returns {String} the sport within the url
 */
export function getSportFromUrl(url) {
  const sport = url.match(/\/sports\/([^/]+)/);
  if (!sport) return null;
  return sport[1].replace(/-/g, "_");
}

/**
 * Adds the events to the data in the respective sport
 * @param {String} url url of current page
 * @param {Array} events array of extra events to be added to the data
 */
function writeToData(url, events) {
  const sport = getSportFromUrl(url);
  if (sport === null) {
    sport = 'other';
  }

  for (const event of events) {
    const title = event.team1Name.toLowerCase() + ' - ' + event.team2Name.toLowerCase();
    // puts the current date but should later be the actual date of the event
    const date = Date.now();
    let newMarket;
    if (event.drawOdds) {
      newMarket = {
        website: 'Ladbrokes',
        team1Name: event.team1Name,
        team1Odds: event.team1Odds,
        drawOdds: event.drawOdds,
        team2Name: event.team2Name,
        team2Odds: event.team2Odds,
      }
    } else {
      newMarket = {
        website: 'Ladbrokes',
        team1Name: event.team1Name,
        team1Odds: event.team1Odds,
        team2Name: event.team2Name,
        team2Odds: event.team2Odds,
      };
    }
    const existingEvent = eventExists(title, sport);
    if (existingEvent != null) {
      existingEvent.markets.push(newMarket);
    } else {
      const newEvent = {
        eventTitle: title,
        date: date,
        markets: [newMarket],
      };
      data[sport].push(newEvent);
    }
  }
}
