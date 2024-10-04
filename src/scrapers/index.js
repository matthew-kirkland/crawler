import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    try{
        const pageHTML = await axios.get("https://www.pitpanda.rocks/players/kanye_fan30");
        const $ = cheerio.load(pageHTML.data);
        console.log($.html());
        const card = $('#side .Card').filter(function() {
            return $(this).find('.Card-Head').text().trim() === 'Leaderboard Positions';
        });
        
        const cardBodyContent = card.find('.Card-Body').text().trim();
        
        console.log(cardBodyContent);
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}