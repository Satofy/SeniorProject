/*
    This file is responsible for all DOM manipulation and UI rendering.
    It contains functions that take data and generate the appropriate
    HTML to be displayed on the page. It does not know where the data
    comes from, only how to display it.
*/


// --- UI ELEMENT SELECTORS ---
// We can define frequently used elements here to avoid searching the DOM repeatedly.
const tournamentsContainer = document.getElementById('tournaments-container');
const dashboardContainer = document.getElementById('dashboard-container');
const gamerRequestsContainer = document.getElementById('gamer-requests-container');
const rosterContainer = document.getElementById('roster-container');
const geminiModal = document.getElementById('gemini-modal');
const modalTitle = document.getElementById('modal-title');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalLoader = document.getElementById('modal-loader');
const modalTextContent = document.getElementById('modal-text-content');


// --- SKELETON LOADER RENDERING ---
/**
 * Renders a specified number of skeleton loader cards into a container.
 * @param {HTMLElement} container - The container element to add skeletons to.
 * @param {number} count - The number of skeletons to create.
 */
function renderSkeletons(container, count = 3) {
    let skeletonHTML = '';
    for (let i = 0; i < count; i++) {
        skeletonHTML += `
            <div class="card-bg rounded-xl overflow-hidden placeholder-glow">
                <div class="h-48 bg-gray-700"></div>
                <div class="p-6">
                    <div class="h-8 w-3/4 bg-gray-700 mb-4 rounded"></div>
                    <div class="h-6 w-1/2 bg-gray-700 mb-4 rounded"></div>
                    <div class="h-12 w-full bg-gray-700 rounded-lg"></div>
                </div>
            </div>`;
    }
    container.innerHTML = skeletonHTML;
}


// --- PAGE CONTENT RENDERING ---

/**
 * Renders the dashboard using data from the mock object.
 * @param {object} data - The dashboard data object.
 */
function renderDashboard(data) {
    const { upcomingGame, stats, financials, liveMatches } = data;

    const financialOverviewHTML = `
        <div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold">Financial Overview</h3><a href="#" class="text-sm accent-red hover:underline">View All</a></div>
        <div class="mb-4"><p class="text-gray-400">Balance</p><p class="text-3xl font-bold text-white">$${financials.balance.toLocaleString()}</p></div>
        <div class="mb-6"><p class="text-gray-400">Overdue</p><p class="text-2xl font-bold accent-red">$${financials.overdue.toLocaleString()}</p></div>
        <div class="flex gap-4"><button class="btn-secondary flex-1 py-2 rounded-lg">Add more</button><button class="btn-primary flex-1 py-2 rounded-lg">Pay overdue</button></div>`;

    const liveMatchesHTML = liveMatches.map(match => `
        <div class="flex justify-between items-center text-sm">
            <span>${match.time}</span><span>${match.team1}</span>
            <span class="font-bold ${match.winner === 'team1' ? 'accent-red' : match.winner === 'team2' ? 'accent-green' : 'text-yellow-500'}">${match.score}</span>
            <span>${match.team2}</span>
        </div>`).join('');

    dashboardContainer.innerHTML = `
        <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="card-bg p-6 rounded-xl">
                 <div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold">Upcoming games</h3><a href="#" class="text-sm accent-red hover:underline">View All</a></div>
                <p class="text-gray-400 mb-4">${upcomingGame.gameTitle} &nbsp;&nbsp; ${upcomingGame.date} &nbsp; ${upcomingGame.time}</p>
                <div class="flex items-center justify-around text-center">
                    <div><i class="fa-solid fa-shield-virus text-6xl text-red-500 mb-2"></i><p class="font-bold text-lg">${upcomingGame.team1}</p></div>
                    <p class="text-4xl font-bold text-gray-500">VS</p>
                    <div><i class="fa-solid fa-horse-head text-6xl text-blue-500 mb-2"></i><p class="font-bold text-lg">${upcomingGame.team2}</p></div>
                </div>
            </div>
            <div class="card-bg p-6 rounded-xl">
                <div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold">Victory - Defeat</h3><a href="#" class="text-sm accent-red hover:underline">View All</a></div>
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-gray-400 mb-4"># games played: ${stats.gamesPlayed} games</p>
                        <div class="flex gap-8 text-center">
                            <div><p class="text-3xl font-bold accent-green">${stats.victories}</p><p class="text-gray-400">Victories</p></div>
                            <div><p class="text-3xl font-bold text-yellow-500">${stats.draws}</p><p class="text-gray-400">Draws</p></div>
                            <div><p class="text-3xl font-bold accent-red">${stats.defeats}</p><p class="text-gray-400">Defeats</p></div>
                        </div>
                    </div>
                    <button id="analyze-performance-btn" class="btn-outline px-4 py-2 rounded-lg">✨ Analyze Performance</button>
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-6">
            <div class="card-bg p-6 rounded-xl">${financialOverviewHTML}</div>
            <div class="card-bg p-6 rounded-xl">
                <div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold">Live matches</h3><a href="#" class="text-sm accent-red hover:underline">View All</a></div>
                <div class="flex flex-col gap-4">${liveMatchesHTML}</div>
            </div>
        </div>`;
}

/**
 * Renders tournament cards using live data from the PandaScore API.
 * @param {Array} tournamentsFromApi - An array of tournament objects from the API.
 */
function renderTournaments(tournamentsFromApi) {
    if (!tournamentsFromApi || tournamentsFromApi.length === 0) {
        tournamentsContainer.innerHTML = `<p class="text-gray-400 p-4 card-bg rounded-lg col-span-full">Could not load upcoming tournaments. Check if your API key is correct in js/api.js.</p>`;
        return;
    }

    tournamentsContainer.innerHTML = tournamentsFromApi.map(t => {
        const leagueName = t.league.name;
        const imageUrl = t.league.image_url || 'https://placehold.co/600x400/1a202c/ffffff?text=No+Image';
        const matchName = t.name;
        const date = new Date(t.scheduled_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        return `
            <div class="card-bg rounded-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img src="${imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/1a202c/ffffff?text=No+Image';" class="w-full h-48 object-cover" alt="${leagueName}">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-1 truncate" title="${leagueName}">${leagueName}</h3>
                    <p class="text-gray-300 font-semibold mb-2 truncate" title="${matchName}">${matchName}</p>
                    <p class="text-gray-400 mb-4 text-sm">${date}</p>
                    <button class="btn-primary w-full py-3 rounded-lg font-bold">View Details</button>
                </div>
            </div>`;
    }).join('');
}

/**
 * Renders the list of gamer requests from mock data.
 * @param {Array} requests - An array of gamer request objects.
 */
function renderGamerRequests(requests) {
    if (!requests || requests.length === 0) {
        gamerRequestsContainer.innerHTML = `<p class="text-gray-400">No pending gamer requests.</p>`;
        return;
    }
    gamerRequestsContainer.innerHTML = requests.map(r => `
        <div class="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
            <div class="flex items-center gap-4"><i class="fa-solid fa-user-circle text-3xl text-gray-400"></i><p class="font-semibold">${r.name}</p></div>
            <div class="flex items-center gap-6 text-center text-sm">
                <div><span class="text-gray-400">K/D Ratio</span><p>${r.kd_ratio}</p></div>
                <div><span class="text-gray-400">Aim accuracy</span><p>${r.aim_accuracy}</p></div>
                <div><span class="text-gray-400">W/L Ratio</span><p>${r.wl_ratio}</p></div>
            </div>
            <div class="flex gap-2">
                <button class="btn-outline px-3 py-1 rounded-lg text-xs scout-report-btn" data-player-name="${r.name}" data-player-stats="K/D Ratio: ${r.kd_ratio}, Aim Accuracy: ${r.aim_accuracy}, W/L Ratio: ${r.wl_ratio}">✨ Scout Report</button>
                <button class="btn-secondary px-4 py-1 rounded-lg text-sm">Reject</button>
                <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm">Accept</button>
            </div>
        </div>`).join('');
}

/**
 * Renders the team roster from mock data.
 * @param {Array} roster - An array of player objects.
 */
function renderRoster(roster) {
    rosterContainer.innerHTML = roster.map(p => `
        <div class="text-center">
            <img src="${p.avatar}" class="rounded-full mx-auto mb-2 border-2 border-gray-600">
            <p class="text-sm font-semibold">${p.name}</p>
        </div>`).join('');
}


// --- MODAL UI CONTROLS ---

/**
 * Opens the Gemini AI modal with a given title.
 * @param {string} title - The title to display in the modal header.
 */
function openModal(title) {
    modalTitle.textContent = title;
    modalTextContent.innerHTML = '';
    modalLoader.style.display = 'flex';
    geminiModal.classList.remove('hidden');
}

/**
 * Closes the Gemini AI modal.
 */
function closeModal() {
    geminiModal.classList.add('hidden');
}

/**
 * Updates the modal content with text from the Gemini API.
 * @param {string} text - The text content to display.
 */
function updateModalContent(text) {
    modalLoader.style.display = 'none';
    // Basic markdown-to-html conversion for better display
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br>'); // Newlines
    modalTextContent.innerHTML = html;
}
