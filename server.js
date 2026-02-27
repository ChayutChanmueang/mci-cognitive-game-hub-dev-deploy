import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv'
import Supabase from "./database.js";

// Load local config
dotenv.config()

// Define variable
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
    const text = await Supabase.hello()
    const row = await Supabase.getRow('attention-sorting-game', "*", "")
    const rowSingle = await Supabase.getRowSingle('attention-sorting-game', "*", "id", "1")
    const createID = await Supabase.createRow('attention-sorting-game',
        {score: 100, highscore: 500, playtime: 30, UID: "9bd1626d-8073-4c49-9564-7fab36f88c6e"})
    const updateID = await Supabase.updateRow('attention-sorting-game',
        {score: 100000, highscore: 500000, playtime: 30000, UID: "5eb4deed-7613-4968-9a2e-f8615880c53a"},
        "id", `${createID}`)

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Try get hello word:${text}`);
      console.log(`Row : ${JSON.stringify(row)}`);
      console.log(`Row Single : ${JSON.stringify(rowSingle)}`);
      console.log(`Create At ID : ${createID}`);
      console.log(`Update At ID : ${updateID}`);
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
