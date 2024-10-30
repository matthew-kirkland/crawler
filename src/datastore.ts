/*
This file is meant to show the structure of how the data is stored in the datastore:
- Each sport has an array of "Event" objects (games)
- Each game has a title, a date (in epoch), and an array of Markets offered by different websites
- Interfaces should be referred to when adding new data

- Javascript hack: you can access e.g the golf array by doing data['golf']
*/

const data: {
  american_football: Event[];
  australian_rules: Event[];
  badminton: Event[];
  baseball: Event[];
  basketball: Event[];
  boxing: Event[];
  cricket: Event[];
  darts: Event[];
  esports: Event[];
  gaelic_sports: Event[];
  golf: Event[];
  handball: Event[];
  ice_hockey: Event[];
  motor_sport: Event[];
  netball: Event[];
  pool: Event[];
  rugby_league: Event[];
  rugby_union: Event[];
  snooker: Event[];
  soccer: Event[];
  table_tennis: Event[];
  tennis: Event[];
  ufc: Event[];
  volleyball: Event[];
  other: Event[];
} = {
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
}

interface Event {
  eventTitle: String,
  date: Number,
  markets: Market[],
}

interface Market {
  website: String,
  team1Name: String,
  team1Odds: Number,
  draw?: Number,
  team2Name: String,
  team2Odds: Number,
}
