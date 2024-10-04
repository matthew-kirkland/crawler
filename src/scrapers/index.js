import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    try{
        const pageHTML = await axios.get("https://www.pitpanda.rocks/players/kanye_fan30");
        const $ = cheerio.load(pageHTML.data);
        console.log($.html());
        const card = $('#root #side .Card');

        // const card = $('#root #side .Card').filter(function() {
        //     return $(this).find('.Card-Head').text().trim() == 'Leaderboard Positions';
        // });
        // console.log(card);
        const leaderboardPositions = card.find('.Card-Body div span').map(function() {
            return $(this).find('span').text().trim();
        }).get();
        console.log(leaderboardPositions);

        const positions = [];

        leaderboardPositions.forEach(function(position) {
            positions.push(parseInt(position.replace(/[^\d]/g, '')));
        });
        let sum = 0;
        let i = 0;
        for (position of positions) {
            sum += position;
            i++;
        }
        console.log(sum / i);
        
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}

main();