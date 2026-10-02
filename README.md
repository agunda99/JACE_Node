# JACE Node

A Node.js USSD callback for event ticket registration and Pochi la Biashara payment instructions.

## Requirements

- Node.js 20.19 or newer
- A Supabase project

## Setup

Install dependencies and create your local environment file:

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` and fill in your event and Supabase project values. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the attendees table. Do not start the server until the required values are filled in.

```dotenv
EVENT_NAME="Your Event Name"
TICKET_PRICE=400
POCHI_NUMBER=YOUR_POCHI_NUMBER
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
PORT=3000
```

Get the project URL and service-role key from your Supabase project settings. The service-role key bypasses row-level security; keep it server-side, never expose it in browser code, and do not commit `.env`. The local `.env` file is ignored by Git.

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

Configure Africa's Talking to send USSD callbacks to `https://YOUR-DOMAIN/ussd`. Use HTTPS for a deployed callback. This service stores attendee names and phone numbers in Supabase; restrict access and handle that data according to your privacy requirements.