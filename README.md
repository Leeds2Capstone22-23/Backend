# Quick Start

Before we start...

```
npm i
```

To start MongoDB and Express API
```
docker-compose up -d
npm start
```

To remove MongoDB container
```
docker-compose down
```

# MongoDB

Under the `backend/model` folder, each TypeScript file contains Mongoose schemas and models that are exported for use within the API. The Express API will connect to this database to deliver content to the frontend over HTTP using CRUD operations.

Use the `docker-compose.yml` file to launch a temporary MongoDB instance in Docker. The command for this is `docker-compose up -d`. To take the MongoDB server down, run `docker-compose down`.

NOTE: A MongoDB instance is required for the Express API to function.

# Schema
## User

Contains user credentials and preferences.

|Field|Type|Description|
|---|---|---|
|username|String|User's username (unique)|
|password|String|User's password **(warning: I am storing this as plaintext for now)**

## Tag

A tag that can be used to classify selections of text and lookup selections within documents.

|Field|Type|Description|
|---|---|---|
|author|ObjectId|ID of the user who created the tag|
|isPrivate|Boolean|Specifies if other users can discover and use this tag|
|name|String|Name of the tag|

## Paper

A document imported by a user that is converted to text and then used for tagging.

|Field|Type|Description|
|---|---|---|
|author|ObjectId|ID of the user who imported the paper|
|isPrivate|Boolean|Specifies if other users can view this paper|
|title|String|Title of the paper|
|text|String|Text content of the paper|
|tags|Array|Contains all tags and selections in this documents|

## Paper.tags

|Field|Type|Description|
|---|---|---|
|tag|ObjectId|ID of a tag used in this paper|
|color|Number|Hex value of the user-selected color for this tag in the paper|
|locations|Object|Every location of a text selection tagged with this tag|
|locations.startIndex|Number|Beginning of text selection (inclusive)|
|locations.endIndex|Number|End of text selection (exclusive)|

# Express API

Work in progress. Currently only endpoints for creating a user. NOTE: I lowkey wanna document the API with Swagger but at the moment I'm too lazy.

The auth scheme for now is HTTP Basic Authentication with plaintext passwords. I hate this and will change it.

To build and start the server, use `npm start`.

# Notes (23 Sep 2022)

- I am open to using GraphQL instead of REST for the API. Someone let me know which they prefer to work with. I am more comfortable with REST but GraphQL is very powerful in certain situations, and I have a little experience with it already. Plus, since MongoDB is basically just JSON and GraphQL exposes JSON, there's a chance they could connect nicely. Idk dude. Jaryd if you have strong feelings on this (like usual) lmk.
- The idea with the `isPrivate` fields is that maybe user-created tags and papers can be used by others and an NLP AI can be trained for specific tags across many user-submitted documents. This would essentially make it so popular/common tags can get free training when users use them to tag new documents. As a benefit to users, they could use a popular tag on their document that more accurately predicts where that tag applies.

## Todo
- Need some sort of auth system. Email/Password? OAuth2?
- Need an API to process documents and convert them to text. This will surely be painless and not induce a severe headache.
- If we go with the public/private papers/tags idea, the frontend will need to reflect that by including a page to search/discover tags and papers. If this is beyond the scope of our first deliverable, we can skip this on the frontend. However, I think this is a very powerful feature that, by design, would encourage users to share data to get better NLP predictions.
- Need to write unit tests instead of manually sending HTTP requests