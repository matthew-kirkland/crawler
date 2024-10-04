import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    try{
        console.log('HELLO!!!!!!!!!!');
        const pageHTML = await axios.get("https://www.pitpanda.rocks/players/kanye_fan30");
        const $ = cheerio.load(pageHTML.data);
        const elements = $('#side .Card .Card-Body');
        console.log(elements);
    } catch (error) {
        console.log('Error fetching page: ', error);
    }
}

main();