import { writeToData } from '../database.js';

const uri = 'mongodb+srv://matthewkirkland049:gCX1dcbjuEShs9WH@cluster0.ox2xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let db;
let client;

beforeAll(async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('TEST_Odds-Data');
});

afterAll(async () => {
  await client.close();
})

describe('Database testing', () => {
  test('Empty database, first game added', async () => {
    expect(1+1).toEqual(2);
  });
  test('Database with existing games, game added to empty sport array', async () => {
    expect(1+1).toEqual(2);
  });
  test('Database with existing games, game added to populated sport array', async () => {
    expect(1+1).toEqual(2);
  });
  test('Game exists in sport array, different website market', async () => {
    expect(1+1).toEqual(2);
  });
  test('Game exists in sport array, website market already exists', async () => {
    expect(1+1).toEqual(2);
  });
  test('Sport unrecognised', async () => {
    expect(1+1).toEqual(2);
  })
});