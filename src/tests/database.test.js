import { MongoClient } from 'mongodb';
import { writeToData } from '../database.js';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let db;
let client;

beforeAll(async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('TEST_Odds-Data');
  await db.collection('Sports').updateMany({}, { $set: { data: [] } });
});

afterAll(async () => {
  await db.collection('Sports').updateMany({}, { $set: { data: [] } });
  await client.close();
});

describe('Database testing', () => {
  describe('One game at a time', () => {
    test('Empty database, first game added', async () => {
      const events = [
        {
          website: 'Ladbrokes',
          team1Name: 'Team1',
          team1Odds: 1.5,
          team2Name: 'Team2',
          team2Odds: 2.5,
        }
      ];
      await writeToData(events, db, 'soccer');
      const response = await db.collection('Sports').findOne({ sport: 'soccer' });
      const expectedData = [
        {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            }
          ],
        },
      ];
      expect(response.data).toStrictEqual(expectedData);
    });
    test('Games in other sports but new game added to empty array', async () => {
      const basketballEvent = {
        eventTitle: 'team1 - team2',
        markets: [
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.5,
            team2Name: 'Team2',
            team2Odds: 2.5,
          }
        ]
      }
      await db.collection('Sports').updateOne({ sport: 'basketball' }, { $set: { data: [basketballEvent] } });
      const events = [
        {
          website: 'Ladbrokes',
          team1Name: 'Team1',
          team1Odds: 1.5,
          team2Name: 'Team2',
          team2Odds: 2.5,
        }
      ];
      await writeToData(events, db, 'soccer');
      const soccerResponse = await db.collection('Sports').findOne({ sport: 'soccer' });
      const basketballResponse = await db.collection('Sports').findOne({ sport: 'basketball' });
      const expectedData = [
        {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            }
          ],
        },
      ];
      expect(soccerResponse.data).toStrictEqual(expectedData);
      expect(basketballResponse.data).toStrictEqual(expectedData);
    });
    test('New game added to array containing other games', async () => {
      const firstEvent = {
        eventTitle: 'team1 - team2',
        markets: [
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.5,
            team2Name: 'Team2',
            team2Odds: 2.5,
          }
        ]
      };
      await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
      const events = [
        {
          website: 'Ladbrokes',
          team1Name: 'Team3',
          team1Odds: 1.5,
          team2Name: 'Team4',
          team2Odds: 2.5,
        }
      ];
      await writeToData(events, db, 'soccer');
      const response = await db.collection('Sports').findOne({ sport: 'soccer' });
      expect(response.data.length).toStrictEqual(2);
      expect(response.data[0].markets.length).toStrictEqual(1);
      expect(response.data[1].markets.length).toStrictEqual(1);
    });
    describe('Game already exists in array', () => {
      test('Different website market', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
              drawOdds: 2.0,
            }
          ]
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Sportsbet',
            team1Name: 'Team1',
            team1Odds: 1.7,
            team2Name: 'Team2',
            team2Odds: 2.7,
            drawOdds: 2.2,
          }
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(1);
        expect(response.data[0].markets.length).toStrictEqual(2);
      });
      test('Same website market', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
              drawOdds: 2.0,
            }
          ]
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.7,
            team2Name: 'Team2',
            team2Odds: 2.7,
            drawOdds: 2.2,
          }
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(1);
        expect(response.data[0].markets.length).toStrictEqual(1);
      });
    });
    describe('Sport unrecognised', () => {
      test('Empty "other" array', async () => {
        const events = [
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.5,
            team2Name: 'Team2',
            team2Odds: 2.5,
          }
        ];
        await writeToData(events, db, 'other');
        const response = await db.collection('Sports').findOne({ sport: 'other' });
        expect(response.data.length).toStrictEqual(1);
      });
      test('"other" array contains game but different website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'other' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Sportsbet',
            team1Name: 'Team1',
            team1Odds: 1.7,
            team2Name: 'Team2',
            team2Odds: 2.7,
          },
        ];
        await writeToData(events, db, 'other');
        const response = await db.collection('Sports').findOne({ sport: 'other' });
        expect(response.data.length).toStrictEqual(1);
        expect(response.data[0].markets.length).toStrictEqual(2);
      });
      test('"other" array contains game and same website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'other' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.7,
            team2Name: 'Team2',
            team2Odds: 2.7,
          },
        ];
        await writeToData(events, db, 'other');
        const response = await db.collection('Sports').findOne({ sport: 'other' });
        expect(response.data.length).toStrictEqual(1);
        expect(response.data[0].markets.length).toStrictEqual(1);
      });
    });
  });

  describe('Multiple games at a time', () => {
    test('Empty database, multiple games added', async () => {
      const events = [
        {
          website: 'Ladbrokes',
          team1Name: 'Team1',
          team1Odds: 1.5,
          team2Name: 'Team2',
          team2Odds: 2.5,
        },
        {
          website: 'Ladbrokes',
          team1Name: 'Team3',
          team1Odds: 3.5,
          team2Name: 'Team4',
          team2Odds: 4.5,
        },
      ];
      await writeToData(events, db, 'soccer');
      const response = await db.collection('Sports').findOne({ sport: 'soccer' });
      expect(response.data.length).toStrictEqual(2);
    });
    describe('New games adding to non-empty array', () => {
      test('New events from different website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Sportsbet',
            team1Name: 'Team3',
            team1Odds: 3.5,
            team2Name: 'Team4',
            team2Odds: 4.5,
          },
          {
            website: 'Sportsbet',
            team1Name: 'Team5',
            team1Odds: 5.5,
            team2Name: 'Team6',
            team2Odds: 6.5,
          },
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(3);
      });
      test('New events from same website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Ladbrokes',
            team1Name: 'Team3',
            team1Odds: 3.5,
            team2Name: 'Team4',
            team2Odds: 4.5,
          },
          {
            website: 'Ladbrokes',
            team1Name: 'Team5',
            team1Odds: 5.5,
            team2Name: 'Team6',
            team2Odds: 6.5,
          },
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(3);
      });
      test('Some events exist already, different website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Sportsbet',
            team1Name: 'Team3',
            team1Odds: 3.5,
            team2Name: 'Team4',
            team2Odds: 4.5,
          },
          {
            website: 'Sportsbet',
            team1Name: 'Team1',
            team1Odds: 1.5,
            team2Name: 'Team2',
            team2Odds: 2.5,
          },
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(2);
        expect(response.data[0].markets.length).toStrictEqual(2);
        expect(response.data[1].markets.length).toStrictEqual(1);
      });
      test('Some events exist already, same website', async () => {
        const firstEvent = {
          eventTitle: 'team1 - team2',
          markets: [
            {
              website: 'Ladbrokes',
              team1Name: 'Team1',
              team1Odds: 1.5,
              team2Name: 'Team2',
              team2Odds: 2.5,
            },
          ],
        };
        await db.collection('Sports').updateOne({ sport: 'soccer' }, { $set: { data: [firstEvent] } });
        const events = [
          {
            website: 'Ladbrokes',
            team1Name: 'Team3',
            team1Odds: 3.5,
            team2Name: 'Team4',
            team2Odds: 4.5,
          },
          {
            website: 'Ladbrokes',
            team1Name: 'Team1',
            team1Odds: 1.5,
            team2Name: 'Team2',
            team2Odds: 2.5,
          },
        ];
        await writeToData(events, db, 'soccer');
        const response = await db.collection('Sports').findOne({ sport: 'soccer' });
        expect(response.data.length).toStrictEqual(2);
        expect(response.data[0].markets.length).toStrictEqual(1);
        expect(response.data[1].markets.length).toStrictEqual(1);
      });
    });
  });
});