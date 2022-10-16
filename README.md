# API & Backend

Using Hasura, creation of the postgres database and GraphQL API is done automatically through easy-to-use GUI interfaces. See documentation at [https://hasura.io/docs/latest/index/](https://hasura.io/docs/latest/index/).

# Usage

Start docker containers for Hasura and Postgres (you may need to use `sudo`)

```
docker-compose up -d
```

Navigate to [http://localhost:8080/](http://localhost:8080/) to view the Hasura console

If running for the **first time**, import Hasura metadata by clicking the settings gear wheel icon in the top right and then clicking `Import metadata`. Select the included `hasura_metadata` file.

Now, the schema can be exported on the `DATA` tab, and the auto-generated GraphQL API can be explored on the `API` tab.