/*
    This file is responsible for all communication with external APIs.
    It handles fetching data from the PandaScore e-sports API,
    and provides mock data for sections that
    are not yet connected to a live service.
*/


// --- MOCK DATA SOURCE ---
// This object simulates a backend response for parts of our app
// that don't have a live API yet (like dashboard and team management).
const MOCK_DATA = {
    dashboard: {
        upcomingGame: { gameTitle: "Counter-Strike", date: "23-Jul-2024", time: "16:00 PM", team1: "Faze", team2: "Liquid Team" },
        stats: { gamesPlayed: 38, victories: 21, draws: 3, defeats: 14 },
        financials: { balance: 20000, overdue: 5000 },
        liveMatches: [
            { time: "7:00 PM", team1: "Faze", team2: "Liquid Team", score: "1 - 2", winner: "team2" },
            { time: "9:00 PM", team1: "Faze", team2: "Liquid Team", score: "1 - 2", winner: "team1" },
            { time: "10:00 PM", team1: "Faze", team2: "Liquid Team", score: "1 - 1", winner: "draw" }
        ]
    },
    gamerRequests: [
        { id: 1, name: "Mohammed Jassim", kd_ratio: 0.9, aim_accuracy: 0.9, wl_ratio: 0.9 },
        { id: 2, name: "Yasser Mohammed", kd_ratio: 1.2, aim_accuracy: 1.1, wl_ratio: 1.3 }
    ],
    roster: [
        { id: 101, name: "Player One", avatar: "https://placehold.co/100x100/333333/FFFFFF?text=P1" },
        { id: 102, name: "Player Two", avatar: "https://placehold.co/100x100/333333/FFFFFF?text=P2" },
        { id: 103, name: "Player Three", avatar: "https://placehold.co/100x100/333333/FFFFFF?text=P3" }
    ]
};


// --- PANDASCORE API FETCHER ---
/**
 * Fetches data from the live PandaScore API.
 * @param {string} endpoint - The specific API endpoint to request (e.g., 'csgo/matches/upcoming').
 * @returns {Promise<Array|Object>} A promise that resolves to the JSON data from the API.
 */
async function realApiFetch(endpoint) {
  try {
    const response = await fetch(
      `/api/pandascore/${encodeURIComponent(endpoint)}`
    );
    if (!response.ok) {
      console.error(
        "Pandascore proxy error",
        response.status,
        await response.text()
      );
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch via proxy:", error);
    return [];
  }
}

// --- SERVER SETUP ---
// Express server code to proxy requests to PandaScore
const express = require("express");
const fetch = require("node-fetch"); // or global fetch if Node 18+
require("dotenv").config();
const app = express();
app.use(express.json());

// CORS if you serve frontend separately
// const cors = require('cors');
// app.use(cors({ origin: 'http://localhost:5500' }));

const PANDA_KEY = process.env.PANDA_KEY;

// Proxy pandascore requests
app.get("/api/pandascore/:encoded", async (req, res) => {
  try {
    const endpoint = decodeURIComponent(req.params.encoded);
    const url = `https://api.pandascore.co/${endpoint}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${PANDA_KEY}` },
    });
    const body = await r.text();
    res.status(r.status).send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server listening on", port));

// --- PACKAGE.JSON ---
// {
//   "name": "rcd-server",
//   "version": "1.0.0",
//   "main": "index.js",
//   "dependencies": {
//     "express": "^4.18.2",
//     "node-fetch": "^2.6.7",
//     "dotenv": "^16.0.3"
//   },
//   "scripts": {
//     "start": "node index.js"
//   }
// }
