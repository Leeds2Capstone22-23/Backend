import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import path from 'path';
import { GraphQLClient, gql } from 'graphql-request';

// use .env file from parent directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// connect to Hasura GraphQL server
const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql');
client.setHeaders({
  'content-type': 'application/json',
  'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'adminsecret',
});

// bcrypt config
const saltRounds = 10;

// express config
const port = process.env.AUTH_PORT || 4308;
const app = express();
app.use(bodyParser.json());

/**
 * Register new users with encrypted passwords
 * @name post/register
 */
app.post('/register', async (req, res) => {
  // extract username/password from Hasura Action
  const { username, password } = req.body.input;
  if (!username || !password) {
    res.sendStatus(400);
  }

  // encrypt password
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  // gql query to insert a single user
  const mutation = gql`
    mutation AddUser($username: String!, $password: String!) {
      insert_users_one(object: {username: $username, password: $password}) {
        id
        username
      }
    }
  `;
  const variables = { username, password: hash }; // use encrypted password
  interface TData {
    insert_users_one: {
      type: object,
      properties: {
        id: number,
        username: string
      }
    }
  }

  // execute query and either send new user id/username or send error
  try {
    const data = await client.request<TData>(mutation, variables);
    res.send(data.insert_users_one);
  } catch (error) {
    res.send(error);
  }
});

/**
 * Auth Webhook for Hasura
 * @name get/
 */
app.get('/', async (req, res) => {
  // if auth header is not present, use public Hasura role
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.send({
      'X-Hasura-Role': 'public',
    });
    return;
  }

  // extract username/password from base64 encoded header
  // example:
  // Authorization: Basic [username:password (as a base64 encoded string)]
  let username: string | undefined;
  let password: string | undefined;
  try {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    [username, password] = auth;
  } catch (error) {
    res.status(400).send(error);
  }
  if (!username || !password) {
    res.sendStatus(400);
  }

  // gql query to lookup user by username
  const query = gql`
    query FindUser($username: String!) {
      users(where: {username: {_eq: $username}}) {
        id
        username
        password
      }
    }
  `;
  const variables = { username };
  interface TData {
    users: { id: number; username: string; password: string }[]
  }

  try {
    const data = await client.request<TData>(query, variables);
    // if user not found, user is undefined
    const user = data.users.length > 0 ? data.users[0] : undefined;
    // check if user exists and then compare plaintext input and hashed password
    if (user && bcrypt.compareSync(password!, user.password)) {
      // credentials are correct, send user id and role to Hasura
      res.send({
        'X-Hasura-User-Id': user.id.toString(),
        'X-Hasura-Role': 'user',
      });
    } else {
      res.sendStatus(401); // credentials are incorrect, 401 unauthorized
    }
  } catch (error) {
    res.status(401).send(error); // send any errors with 401 unauthorized status
  }
});

app.listen(port, () => {
  console.log(`we authenticating on port ${port}`);
});
