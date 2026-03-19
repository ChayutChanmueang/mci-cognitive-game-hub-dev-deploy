import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Supabase from "./database.js";

// Define variable
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Start supabase functions
let server;
async function startConnect() {
  try {
    await Supabase.connect();
    console.log("Supabase connected successfully.");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  console.log(`Supabase connection closing.`);

  if (Supabase) {
    await Supabase.disconnect();
    console.log("Supabase connection closed.");
  }

  process.exit(0);
}


// Start express server
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.post('/api/getrow', async (req, res) => {
  const { from, select, order, ascending } = req.body;

  try {
    const data = await Supabase.getRow(from, select, order, ascending);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/getrowsingle', async (req, res) => {
  const { from, select, row, value } = req.body;

  try {
    const data = await Supabase.getRowSingle(from, select, row, value);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/createrow', async (req, res) => {
  const { from, insert } = req.body;

  try {
    const data = await Supabase.createRow(from, insert);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/updaterow', async (req, res) => {
  const { from, update, row, value } = req.body;

  try {
    const data = await Supabase.updateRow(from, update, row, value);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start supabase connect
await startConnect();
