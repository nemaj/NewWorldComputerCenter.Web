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

## Notes

This app records that a customer paid an invoice on a given date. It intentionally does not collect or process payment method details.
