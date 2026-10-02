const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const { EVENT_NAME, POCHI_NUMBER, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const TICKET_PRICE = Number(process.env.TICKET_PRICE);
const PORT = Number(process.env.PORT || 3000);

const missingConfig = [
  "EVENT_NAME",
  "TICKET_PRICE",
  "POCHI_NUMBER",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
].filter((key) => !process.env[key]);
if (missingConfig.length > 0) {
  throw new Error(`Missing required environment variables: ${missingConfig.join(", ")}`);
}
if (!Number.isFinite(TICKET_PRICE) || TICKET_PRICE <= 0) {
  throw new Error("TICKET_PRICE must be a positive number");
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const app = express();
app.use(express.urlencoded({ extended: false })); // Africa's Talking sends form data

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "JACE USSD service is running", ussdCallback: "POST /ussd" });
});

app.post("/ussd", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  res.set("Content-Type", "text/plain");

  if (!sessionId || !phoneNumber) {
    console.error("USSD callback is missing sessionId or phoneNumber");
    return res.status(400).send("END Unable to verify this USSD session. Please try again.");
  }

  const steps = text ? text.split("*") : [];

  // Screen 1: confirm registration and show the payment method.
  if (steps.length === 0) {
    return res.send(
      `CON ${EVENT_NAME}\nTicket: KSh ${TICKET_PRICE}\nPay manually by M-Pesa to Pochi la Biashara.\n1. Register and get payment details\n2. Cancel`
    );
  }
  if (steps[0] === "2") return res.send("END Cancelled. Dial again anytime.");
  if (steps[0] !== "1") return res.send("END Invalid choice. Please dial again.");

  // Screen 2: collect a name before storing the attendee.
  if (steps.length === 1) {
    return res.send("CON Enter your full name to register:");
  }

  // Screen 3: save the attendee, then show manual payment instructions.
  const name = steps.slice(1).join(" ").trim().slice(0, 40);
  if (name.length < 2) return res.send("END Invalid name. Please dial again.");

  try {
    const { error } = await supabase.from("jace_event_attendees").upsert(
      { session_id: sessionId, event: EVENT_NAME, name, phone: phoneNumber },
      { onConflict: "session_id", ignoreDuplicates: true }
    );
    if (error) throw error;
  } catch (err) {
    console.error("Supabase attendee upsert failed:", err.code, err.message);
    return res.send("END Sorry, something went wrong. Please try again.");
  }

  res.send(
    `END Registration saved, ${name.split(" ")[0]}.\nPay KSh ${TICKET_PRICE} manually by M-Pesa to Pochi la Biashara:\n${POCHI_NUMBER}`
  );
});

app.listen(PORT, () => console.log(`USSD server running on port ${PORT}`));