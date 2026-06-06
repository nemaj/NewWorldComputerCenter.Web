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

### Deployment overview

The deployment has two computers:

- Build computer: contains the complete project and creates the deployment package.
- Destination computer: receives only the deployment package and runs it with Docker.

The final folder copied to the destination computer will contain:

```text
NWCC-Deploy/
  docker-compose.yml
  nwcc-images.tar
```

Do not copy only `apps\api\dist` and `apps\web\.next`. Those directories do not contain all Node.js runtime dependencies. The Docker archive `nwcc-images.tar` is the complete build package.

### 1. Prepare the build computer

Install and start Docker Desktop. Docker Desktop must be configured to use Linux containers.

Open PowerShell and move to the project directory:

```powershell
Set-Location "C:\Data\Solutions\NewWorldComputerCenter.Web"
```

Install the exact dependencies from `package-lock.json`:

```powershell
npm ci
```

### 2. Build and verify the API and frontend

Build the NestJS API:

```powershell
npm run build -w apps/api
```

The API build output is created at:

```text
C:\Data\Solutions\NewWorldComputerCenter.Web\apps\api\dist
```

Build the Next.js frontend with the hostname that will be used on the destination computer:

```powershell
$env:NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4000/graphql"
npm run build -w apps/web
```

The frontend build output is created at:

```text
C:\Data\Solutions\NewWorldComputerCenter.Web\apps\web\.next
```

These commands verify that both applications compile successfully. The next step packages them with their runtime dependencies into Docker images.

### 3. Build the Docker images

Run these commands from `C:\Data\Solutions\NewWorldComputerCenter.Web`:

```powershell
docker build --target api -t nwcc-api:1.0 .
docker build --target web --build-arg NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql -t nwcc-web:1.0 .
docker pull mongo:7
```

`NEXT_PUBLIC_GRAPHQL_URL` is supplied while building because public Next.js environment variables are included in the frontend build.

Confirm that all three images exist:

```powershell
docker image ls nwcc-api
docker image ls nwcc-web
docker image ls mongo
```

### 4. Create the deployment folder

Create a deployment directory and save all required images into one archive:

```powershell
New-Item -ItemType Directory -Force "C:\NWCC-Deploy"
docker save -o "C:\NWCC-Deploy\nwcc-images.tar" nwcc-api:1.0 nwcc-web:1.0 mongo:7
```

Create `C:\NWCC-Deploy\docker-compose.yml` with the following content:

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
      NEXT_PUBLIC_GRAPHQL_URL: http://localhost:4000/graphql
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  mongo-data:
```

The completed deployment folder should be:

```text
C:\NWCC-Deploy\
  docker-compose.yml
  nwcc-images.tar
```

The `.tar` file can be several hundred megabytes because it contains the frontend, API, Node.js runtime, dependencies, and MongoDB image.

### 5. Copy the deployment folder

Copy the complete `C:\NWCC-Deploy` folder to a USB drive, shared drive, or other removable storage.

For example, if the USB drive is `E:`, run:

```powershell
Copy-Item -Path "C:\NWCC-Deploy" -Destination "E:\" -Recurse
```

On the destination computer, copy that folder to:

```text
C:\NWCC-Deploy
```

For example, with the USB drive still mounted as `E:`:

```powershell
Copy-Item -Path "E:\NWCC-Deploy" -Destination "C:\" -Recurse
```

The destination path can be different, but all Docker commands must be run from the directory containing `docker-compose.yml`.

### 6. Prepare the destination computer

Install and start Docker Desktop on the destination computer. Node.js, npm, and the project source code are not required.

Confirm that Docker is running:

```powershell
docker version
docker compose version
```

### 7. Load the build images

Open PowerShell on the destination computer and move to the copied deployment folder:

```powershell
Set-Location "C:\NWCC-Deploy"
```

Confirm that both files are present:

```powershell
Get-ChildItem
```

Load the frontend, API, and MongoDB images:

```powershell
docker load -i .\nwcc-images.tar
```

This command can take several minutes. Confirm that the images were loaded:

```powershell
docker image ls
```

The list should include:

```text
nwcc-api    1.0
nwcc-web    1.0
mongo       7
```

### 8. Start the application

From `C:\NWCC-Deploy`, run:

```powershell
docker compose up -d
```

Check the container status:

```powershell
docker compose ps
```

The `mongo`, `api`, and `web` services should be running.

Open the application locally:

```text
http://localhost:3000
```

The GraphQL API is available at:

```text
http://localhost:4000/graphql
```

If the application does not open immediately, wait for MongoDB and the API to finish starting, then inspect the logs:

```powershell
docker compose logs -f
```

Press `Ctrl+C` to stop following the logs. This does not stop the containers.

### 9. Stop or restart the application

Stop the application without deleting the MongoDB data:

```powershell
Set-Location "C:\NWCC-Deploy"
docker compose down
```

Start it again:

```powershell
Set-Location "C:\NWCC-Deploy"
docker compose up -d
```

Restart all services:

```powershell
Set-Location "C:\NWCC-Deploy"
docker compose restart
```

MongoDB data is stored in the `mongo-data` Docker volume and remains available when the containers are stopped or recreated. Do not run `docker compose down -v` unless the database should be deleted.

### 10. Deploy a newer build

On the build computer, rebuild both Docker images and recreate `nwcc-images.tar` using steps 2 through 4.

Replace this file on the destination computer:

```text
C:\NWCC-Deploy\nwcc-images.tar
```

Then run on the destination computer:

```powershell
Set-Location "C:\NWCC-Deploy"
docker compose down
docker load -i .\nwcc-images.tar
docker compose up -d --force-recreate
```

The existing MongoDB volume is reused, so application data is retained.

### Local access limitation

`localhost` points to the destination computer itself, so these URLs are accessible only from that computer. Other computers cannot use `localhost` to access this application.

## Notes

This app records that a customer paid an invoice on a given date. It intentionally does not collect or process payment method details.
