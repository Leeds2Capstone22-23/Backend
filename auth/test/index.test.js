const { GraphQLClient, gql } = require('graphql-request');
const dotenv = require('dotenv');
const path = require('path');
const req = require('supertest');
const { v4: uuid } = require('uuid');
const app = require('../dist/index');

// use .env file from parent directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// connect to Hasura GraphQL server
const gqlClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql');
gqlClient.setHeaders({
  'content-type': 'application/json',
  'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'adminsecret',
});

// tracks dummy users that these tests create
const registeredUserIds = [];

// genereate a random user (and optionally register them too)
async function getRandomCredentials(register = false) {
  const creds = { username: `test-${uuid()}`, password: uuid() };
  if (register) {
    const res = await req(app).post('/register').send({ input: creds });
    if (res?.body?.id) registeredUserIds.push(res.body.id);
  }
  return creds;
}

// construct an Authorization header for some credentials
function getAuthHeader(creds) {
  return `Basic ${Buffer.from(`${creds.username}:${creds.password}`).toString('base64')}`;
}

describe('POST /register', () => {
  describe('should return 400 when', () => {
    test('body is missing', async () => {
      const res = await req(app).post('/register');
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('input is missing', async () => {
      const res = await req(app).post('/register').send({ sample: 'text' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('input is empty', async () => {
      const res = await req(app).post('/register').send({ input: {} });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('password is missing', async () => {
      const res = await req(app).post('/register').send({ input: { username: 'test' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('username is missing', async () => {
      const res = await req(app).post('/register').send({ input: { password: 'test' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('password is empty', async () => {
      const res = await req(app).post('/register').send({ input: { username: 'test', password: '' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('username is empty', async () => {
      const res = await req(app).post('/register').send({ input: { username: '', password: 'test' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });

    test('username and password are both empty', async () => {
      const res = await req(app).post('/register').send({ input: { username: '', password: '' } });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({});
    });
  });

  describe('should return 200 and user info when', () => {
    test('username and password are present when username is not taken', async () => {
      const creds = await getRandomCredentials();
      const res = await req(app).post('/register').send({ input: creds });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        username: creds.username,
      });
      registeredUserIds.push(res.body.id);
    });
  });

  describe('should return 401 when', () => {
    test('username is taken', async () => {
      const creds = await getRandomCredentials(true);
      const res = await req(app).post('/register').send({ input: creds });
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({});
    });
  });
});

describe('GET /', () => {
  describe('should return 200 and public role when', () => {
    test('auth header is missing', async () => {
      const res = await req(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        'X-Hasura-Role': 'public',
      });
    });

    test('auth header is empty', async () => {
      const res = await req(app).get('/').set({ Authorization: '' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        'X-Hasura-Role': 'public',
      });
    });
  });

  describe('should return 400 when', () => {
    test('auth header is nonsense', async () => {
      const res = await req(app).get('/').set({ Authorization: 'nonsense' });
      expect(res.statusCode).toBe(400);
    });

    test('auth header contains empty password', async () => {
      const res = await req(app).get('/').set({ Authorization: 'Basic username:' });
      expect(res.statusCode).toBe(400);
    });

    test('auth header contains empty username', async () => {
      const res = await req(app).get('/').set({ Authorization: 'Basic :password' });
      expect(res.statusCode).toBe(400);
    });

    test('auth header contains empty username and password', async () => {
      const res = await req(app).get('/').set({ Authorization: 'Basic :' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('should return 401 when', () => {
    test('credentials are invalid', async () => {
      const header = getAuthHeader(await getRandomCredentials());
      const res = await req(app).get('/').set({ Authorization: header });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('should return 200 and user info when', () => {
    test('credentials are valid', async () => {
      const header = getAuthHeader(await getRandomCredentials(true));
      const res = await req(app).get('/').set({ Authorization: header });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        'X-Hasura-User-Id': expect.stringMatching(/^\d+/),
        'X-Hasura-Role': 'user',
      });
    });
  });
});

afterAll(async () => {
  // delete all dummy users from database
  const mutation = gql`
    mutation DeleteTestUser($id: bigint!) {
      delete_users_by_pk(id: $id) {
        username
      }
    }
  `;
  try {
    await Promise.all(registeredUserIds.map(async (id) => {
      await gqlClient.request(mutation, { id });
    }));
  } catch (err) {
    console.log(err);
  }

  // shutdown express server
  app.close();
});
