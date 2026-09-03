# Campus Connect Registration

A Dockerized college-event registration application with an Express API, browser form, and MongoDB persistence.

## Run locally with Docker

Requirements: Docker Desktop with Compose v2.

```bash
docker compose up --build
```

Open <http://localhost:3000>. Registrations are stored in the named Docker volume `college_event_data` and survive `docker compose down`.

To remove the database as well:

```bash
docker compose down -v
```

## Run without a volume

This disposable setup demonstrates the non-persistent case:

```bash
docker compose -f docker-compose.no-volume.yml up --build
```

Data disappears when the MongoDB container is removed. Stop it with:

```bash
docker compose -f docker-compose.no-volume.yml down
```

## Run without Docker

Start MongoDB locally, then run:

```bash
npm install
npm start
```

The API exposes `POST /api/registrations`, `GET /api/registrations`, and `GET /health`.
