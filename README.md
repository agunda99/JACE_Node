# JACE Node

A Node.js USSD callback for event ticket registration and Pochi la Biashara payment instructions.

## Requirements

- Node.js 20.19 or newer
- MongoDB, either local or hosted

## Setup

Install dependencies, then create a local `.env` file in the project root with your own settings:

```dotenv
EVENT_NAME="Your Event Name"
TICKET_PRICE=400
POCHI_NUMBER=YOUR_POCHI_NUMBER
MONGO_URI=mongodb://127.0.0.1:27017/events
PORT=3000
```

`.env` contains private configuration and is ignored by Git. Do not commit it.

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