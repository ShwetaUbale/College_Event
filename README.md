# Campus Connect Registration

A Dockerized college-event registration application with an Express API, browser form, and MongoDB persistence.

## Docker instructions

You need Docker Desktop. Open PowerShell and run the commands from this folder:

```powershell
cd "D:\git and jira\College_Event"
```

Only run one setup at a time. Stop the first setup before starting the other one.

### 1. Run without a volume

This setup is for testing. Your registration data will not be saved after you remove the containers.

Start the app:

```powershell
docker compose -f docker-compose.no-volume.yml up -d --build
```

Check that the app and database are running:

```powershell
docker compose -f docker-compose.no-volume.yml ps
```

Open this address in your browser:

<http://localhost:3000>

Fill in the form and press the registration button.

To see the registrations, run:

```powershell
docker compose -f docker-compose.no-volume.yml exec mongo mongosh college_event --quiet --eval "db.registrations.find().pretty()"
```

When you are finished, stop the app:

```powershell
docker compose -f docker-compose.no-volume.yml down
```

### 2. Run with a volume

This setup saves your registration data. The data stays safe when you stop the containers.

Start the app:

```powershell
docker compose up -d --build
```

Check that the app and database are running:

```powershell
docker compose ps
```

Open this address in your browser:

<http://localhost:3000>

Fill in the form and press the registration button.

To see the registrations, run:

```powershell
docker compose exec mongo mongosh college_event --quiet --eval "db.registrations.find().pretty()"
```

Stop the app but keep the data:

```powershell
docker compose down
```

Start it again later without building again:

```powershell
docker compose up -d
```

The data is saved in the Docker volume `college_event_data`.

To delete the app, containers, volume, and all registration data forever, run:

```powershell
docker compose down -v
```

## Run without Docker

Start MongoDB locally, then run:

```bash
npm install
npm start
```

The API exposes `POST /api/registrations`, `GET /api/registrations`, and `GET /health`.

## Jenkins

Create a Jenkins Pipeline job that uses this repository and its `Jenkinsfile`. The Jenkins agent must have Docker, Docker Compose v2, and `curl`. Node.js and npm do not need to be installed on the Jenkins machine because the pipeline runs Node commands inside the `node:22-alpine` Docker image.

The pipeline checks the JavaScript files and Compose configuration, builds the Docker image, starts the app with MongoDB, checks `/health`, and removes the test containers afterward.
