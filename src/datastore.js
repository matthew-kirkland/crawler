import fs from 'fs';
/*
This file is meant to show the structure of how the data is stored in the datastore:
- Each sport has an array of "Event" objects (games)
- Each game has a title, a date (in epoch), and an array of Markets offered by different websites
- Interfaces should be referred to when adding new data

- Javascript hack: you can access e.g the golf array by doing data['golf']
*/
export let data = {
    american_football: [],
    australian_rules: [],
    badminton: [],
    baseball: [],
    basketball: [],
    boxing: [],
    cricket: [],
    darts: [],
    esports: [],
    gaelic_sports: [],
    golf: [],
    handball: [],
    ice_hockey: [],
    motor_sport: [],
    netball: [],
    pool: [],
    rugby_league: [],
    rugby_union: [],
    snooker: [],
    soccer: [],
    table_tennis: [],
    tennis: [],
    ufc: [],
    volleyball: [],
    other: [],
};
export function save() {
    fs.writeFileSync('saved_data.json', JSON.stringify(data, null, 2));
}
export function load() {
    const rawData = fs.readFileSync('saved_data.json', 'utf-8');
    data = JSON.parse(rawData);
}
export function clear() {
    data = {
        american_football: [],
        australian_rules: [],
        badminton: [],
        baseball: [],
        basketball: [],
        boxing: [],
        cricket: [],
        darts: [],
        esports: [],
        gaelic_sports: [],
        golf: [],
        handball: [],
        ice_hockey: [],
        motor_sport: [],
        netball: [],
        pool: [],
        rugby_league: [],
        rugby_union: [],
        snooker: [],
        soccer: [],
        table_tennis: [],
        tennis: [],
        ufc: [],
        volleyball: [],
        other: [],
    };
    save();
}
