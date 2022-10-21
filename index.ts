import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './model/User';

const app = express();
const port = 4308;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/', {
  user: 'nerd',
  pass: 'csci4308',
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      if (await User.exists({ username })) {
        res.sendStatus(401);
      } else {
        await new User({ username, password }).save();
        res.status(201).send('User successfully registered!');
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
});

app.get('/login', async (req, res) => {
  const auth = req.headers.authorization;
  if (auth) {
    const creds = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const username = creds[0];
    const password = creds[1];

    try {
      if (await User.exists({ username, password })) {
        res.status(200).send('Auth successful. Now what?');
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`chilling on port ${port}`);
});
