// filepath: /rcd-app/rcd-app/src/api.js
/*
    This file handles communication with external APIs,
    including fetching data and providing mock data for parts of the application.
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


// --- GEMINI API FETCHER ---
/**
 * Sends a prompt to the Gemini API and returns the response.
 * @param {string} prompt - The prompt to send to the AI model.
 * @returns {Promise<string>} A promise that resolves to the text response from the AI.
 */
async function callGeminiAPI(prompt) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      console.error(
        "Gemini proxy error",
        response.status,
        await response.text()
      );
      throw new Error("Gemini proxy failed");
    }
    const data = await response.json();
    return data.text || "No response from AI";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while contacting the AI assistant. Please check the console for details.";
  }
}

export { MOCK_DATA, realApiFetch, callGeminiAPI };