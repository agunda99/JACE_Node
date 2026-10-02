const express = require("express");
const mongoose = require("mongoose");

const { EVENT_NAME, POCHI_NUMBER, MONGO_URI } = process.env;
const TICKET_PRICE = Number(process.env.TICKET_PRICE);
const PORT = Number(process.env.PORT || 3000);

const missingConfig = ["EVENT_NAME", "TICKET_PRICE", "POCHI_NUMBER", "MONGO_URI"].filter(
  (key) => !process.env[key]
);
if (missingConfig.length > 0) {
  throw new Error(`Missing required environment variables: ${missingConfig.join(", ")}`);
}
if (!Number.isFinite(TICKET_PRICE) || TICKET_PRICE <= 0) {
  throw new Error("TICKET_PRICE must be a positive number");
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const attendeeSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  event: String,
  name: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
});
const Attendee = mongoose.model("Attendee", attendeeSchema);

const app = express();
app.use(express.urlencoded({ extended: false })); // Africa's Talking sends form data

app.post("/ussd", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  res.set("Content-Type", "text/plain");

  const steps = text ? text.split("*") : [];

  // Screen 1: ask the customer to confirm the payment
  if (steps.length === 0) {
    return res.send(
      `CON ${EVENT_NAME}\nTicket: KSh ${TICKET_PRICE}\nDo you want to pay?\n1. Yes, confirm\n2. Cancel`
    );
  }
  if (steps[0] === "2") return res.send("END Cancelled. Dial again anytime.");
  if (steps[0] !== "1") return res.send("END Invalid choice. Please dial again.");

  // Screen 2: ask for name (USSD gives us the phone number, but not the name)
  if (steps.length === 1) {
    return res.send("CON Enter your full name:");
  }

  // Screen 3: save and show payment instructions
  const name = steps[1].trim().slice(0, 40);
  if (name.length < 2) return res.send("END Invalid name. Please dial again.");

  try {
    // upsert so a retried request in the same session doesn't create duplicates
    await Attendee.updateOne(
      { sessionId },
      { $setOnInsert: { sessionId, event: EVENT_NAME, name, phone: phoneNumber } },
      { upsert: true }
    );
  } catch (err) {
    console.error("DB error:", err);
    return res.send("END Sorry, something went wrong. Please try again.");
  }

  res.send(
    `END Thanks ${name.split(" ")[0]}!\nSend KSh ${TICKET_PRICE} to Pochi la Biashara:\n${POCHI_NUMBER}`
  );
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`USSD server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exitCode = 1;
  });