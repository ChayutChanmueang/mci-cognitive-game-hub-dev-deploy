import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv'
import Supabase from "./database.js";

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Start supabase functions
let server;
async function startConnect() {
  try {
    await Supabase.connect(12);
    console.log("Supabase connected successfully.");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  try {
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    Error(err.message);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  console.log(`Supabase connection closing.`);

  if (Supabase) {
    await Supabase.disconnect(() => {
      console.log("Supabase connection closed.");
    });
  }

  process.exit(0);
}

// Start supabase connect
await startConnect();


// Start express server
app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
