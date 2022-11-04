# API & Backend

Using [Hasura](https://hasura.io/docs/latest/index/), creation of both the PostgreSQL database and GraphQL Schema are done automatically through an easy-to-use web UI. An API server can be created quickly using Docker Compose, and all configurations can be depolyed with a few commands.

# Usage

Start authentication server locally (run inside the `auth` folder). Note that this service *should* be accessible from within the Hasura Docker container using the `extra_hosts` option added to the compose file, however this has only been tested on linux so far.

```
yarn          # only need to run once or if node_modules folder does not exist
yarn start
```

Start docker containers for Hasura and Postgres (you may need to use `sudo`)

```
docker-compose up -d
```

[Migrations and Metadata](https://hasura.io/docs/latest/migrations-metadata-seeds/index/) for Hasura are stored under the `project` folder and are automatically applied on startup.

Then, to access the Hasura web UI, first [install the Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) and then, inside the `project` folder, run

```
hasura console
```

You may need to wait for the Docker container to finish starting.

## Note

The reason the web UI should always be accessed through `hasura console` rather than using the endpoint directly is so that all migrations are saved for any changes you may have made within Hasura that you want pushed to version control. If the web endpoint is accessed directly, these migrations may not be properly tracked.

# DB Schema Diagram

![diagram](https://user-images.githubusercontent.com/6487079/198708902-3999ccaa-1741-4275-a6cb-1324fe5347c7.png)

# queries.gql

The `queries.gql` file contains example queries for more complex operations.
