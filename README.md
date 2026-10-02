# JACE Node

A Node.js USSD callback for event ticket registration and Pochi la Biashara payment instructions.

## Requirements

- Node.js 20.19 or newer
- MongoDB, either local or hosted

## Setup

Install dependencies and create a local environment file:

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` and set the event name, ticket price, Pochi number, and MongoDB connection string. `.env` contains private configuration and is ignored by Git.

## Run

```powershell
npm start
```

For development with automatic restarts:

```powershell
npm run dev
```

Check JavaScript syntax with:

```powershell
npm run check
```

Configure Africa's Talking to send USSD callbacks to `https://YOUR-DOMAIN/ussd`. Use HTTPS for a deployed callback. This service stores attendee names and phone numbers in MongoDB; restrict database access and handle that data according to your privacy requirements.