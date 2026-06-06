# Internet Subscription Manager

A full-stack admin dashboard for managing internet subscription plans, customers, monthly invoices, and payment records.

## Stack

- Frontend: Next.js, React, Apollo Client, Tailwind CSS, SASS modules
- Backend: NestJS, Apollo GraphQL, Mongoose
- Database: MongoDB

## Features

- Manage customers and internet plans
- Assign customers to plans through subscriptions
- Generate invoices for active subscriptions by billing month
- Record invoice payments by date without storing card or bank details
- Dashboard summary for revenue, paid invoices, unpaid invoices, and active subscriptions

## Run Locally

1. Copy `.env.example` to `.env` and adjust the MongoDB URI if needed.
2. Install dependencies:

```bash
npm install
```

3. Start the API:

```bash
npm run dev:api
```

4. Start the web app in another terminal:

```bash
npm run dev:web
```

The API runs at `http://localhost:4000/graphql`.
The web dashboard runs at `http://localhost:3000`.

## Deploy to Another Computer with Docker

This method transfers Docker images instead of copying the complete project. The destination computer does not need Node.js, npm, or the source code. It only needs Docker Desktop.

### 1. Build the application images

Run these commands from the project directory on the build computer:

```powershell
docker build --target api -t nwcc-api:1.0 .
docker build --target web --build-arg NEXT_PUBLIC_GRAPHQL_URL=http://newworld.local:4000/graphql -t nwcc-web:1.0 .
docker pull mongo:7
```

`NEXT_PUBLIC_GRAPHQL_URL` is supplied while building because public Next.js environment variables are included in the frontend build.

### 2. Export the images

Create a deployment directory and save all required images into one archive:

```powershell
New-Item -ItemType Directory -Force deploy
docker save -o deploy\nwcc-images.tar nwcc-api:1.0 nwcc-web:1.0 mongo:7
```

Create `deploy\docker-compose.yml` with the following content:

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  api:
    image: nwcc-api:1.0
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://mongo:27017/internet_subscriptions
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      - mongo

  web:
    image: nwcc-web:1.0
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_GRAPHQL_URL: http://newworld.local:4000/graphql
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  mongo-data:
```

Copy only these files to the destination computer:

```text
deploy/
  docker-compose.yml
  nwcc-images.tar
```

### 3. Configure the local hostname

On the destination Windows computer, open Notepad as Administrator and edit:

```text
C:\Windows\System32\drivers\etc\hosts
```

Add this line:

```text
127.0.0.1 newworld.local
```

This hostname is available only on that computer. Repeat this hosts-file entry on any other computer that needs to use the same hostname.

### 4. Load and run the application

Open PowerShell in the copied `deploy` directory:

```powershell
docker load -i .\nwcc-images.tar
docker compose up -d
```

Open the application locally:

```text
http://newworld.local:3000
```

The GraphQL API is available at:

```text
http://newworld.local:4000/graphql
```

Check the running containers:

```powershell
docker compose ps
```

View service logs if the application does not start:

```powershell
docker compose logs -f
```

Stop the application without deleting the MongoDB data:

```powershell
docker compose down
```

To deploy a new version, rebuild and export the images on the build computer, replace `nwcc-images.tar` on the destination computer, and run:

```powershell
docker compose down
docker load -i .\nwcc-images.tar
docker compose up -d --force-recreate
```

MongoDB data is stored in the `mongo-data` Docker volume and remains available when the containers are recreated.

## Notes

This app records that a customer paid an invoice on a given date. It intentionally does not collect or process payment method details.
