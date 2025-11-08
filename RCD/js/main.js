/*
    This file is the main controller of the application.
    It initializes the app, sets up event listeners, and orchestrates
    the flow of data from the API layer (api.js) to the UI layer (ui.js).
*/


// --- APP INITIALIZATION ---

// This event listener ensures that our script runs only after the entire
// HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * The main function to kick off the application.
 */
function initializeApp() {
    console.log("E-sports Platform Initialized");
    setupEventListeners();
    
    // Load the default page (Dashboard) when the app starts.
    // We pass 'true' to indicate this is the initial load.
    loadPageData('dashboard', true); 
}


// --- EVENT LISTENERS SETUP ---

/**
 * Sets up all the necessary event listeners for the application.
 */
function setupEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            showPage(pageId);
            loadPageData(pageId);
        });
    });

    // Modal close button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Clicking outside the modal to close it
    if (geminiModal) {
        geminiModal.addEventListener('click', (e) => {
            if (e.target === geminiModal) {
                closeModal();
            }
        });
    }

    // Event delegation for dynamically created buttons (like AI analysis)
    // We listen on a static parent element (document) for clicks.
    document.addEventListener('click', function(e) {
        // AI Performance Analysis button
        if (e.target && e.target.id === 'analyze-performance-btn') {
            handlePerformanceAnalysis();
        }
        // AI Scout Report button
        if (e.target && e.target.classList.contains('scout-report-btn')) {
            handleScoutReport(e.target);
        }
    });
}


// --- DATA LOADING & PAGE ROUTING ---

/**
 * Fetches data for a specific page and triggers the rendering.
 * @param {string} pageId - The ID of the page to load (e.g., 'home', 'dashboard').
 * @param {boolean} [isInitialLoad=false] - Flag to check if it's the first page load.
 */
async function loadPageData(pageId, isInitialLoad = false) {
    // On initial load, the dashboard is already visible, so we just load its data.
    // For other pages, we show the page first, then load data.
    if (!isInitialLoad) {
        showPage(pageId);
    }

    try {
        if (pageId === 'dashboard') {
            // Dashboard uses mock data for now.
            renderDashboard(MOCK_DATA.dashboard);
        } else if (pageId === 'home') {
            // Home page fetches live data. Show skeletons while loading.
            renderSkeletons(tournamentsContainer, 3);
            const tournaments = await realApiFetch('csgo/matches/upcoming?sort=-scheduled_at&per_page=3');
            renderTournaments(tournaments);
        } else if (pageId === 'team') {
            // Team page uses mock data.
            renderGamerRequests(MOCK_DATA.gamerRequests);
            renderRoster(MOCK_DATA.roster);
        }
    } catch (error) {
        console.error(`Failed to load data for page ${pageId}:`, error);
        // Here you could render an error message to the user on the specific page.
    }
}

/**
 * Controls which page is visible to the user.
 * @param {string} pageId - The ID of the page to show.
 */
function showPage(pageId) {
    const pageContents = document.querySelectorAll('.page-content');
    const navLinks = document.querySelectorAll('.nav-link');

    pageContents.forEach(page => page.classList.add('hidden'));
    const activePage = document.getElementById(pageId + '-page');
    if (activePage) activePage.classList.remove('hidden');
    
    navLinks.forEach(link => {
        const isCurrentPage = link.dataset.page === pageId;
        link.classList.toggle('text-white', isCurrentPage);
        link.classList.toggle('bg-gray-700/50', isCurrentPage);
        link.classList.toggle('text-gray-400', !isCurrentPage);
    });
}


// --- FEATURE-SPECIFIC HANDLERS ---

/**
 * Handles the logic for the 'Analyze Performance' button click.
 */
async function handlePerformanceAnalysis() {
    const prompt = `
        You are an expert e-sports coach for a competitive Counter-Strike team. 
        My team's recent performance is 21 victories, 14 defeats, and 3 draws over 38 games.
        Provide a brief, insightful analysis of this performance. 
        Highlight potential strengths based on the win rate.
        Then, suggest 3 concrete, actionable areas for improvement to help us become a top-tier team.
        Format your response clearly with headings.
    `;
    openModal('✨ AI Performance Analyst');
    const analysis = await callGeminiAPI(prompt);
    updateModalContent(analysis);
}

/**
 * Handles the logic for the 'Scout Report' button click.
 * @param {HTMLElement} buttonElement - The button that was clicked.
 */
async function handleScoutReport(buttonElement) {
    const playerName = buttonElement.dataset.playerName;
    const playerStats = buttonElement.dataset.playerStats;
    const prompt = `
        You are an expert e-sports team manager for a highly competitive Counter-Strike team.
        A player named "${playerName}" has requested to join our team. 
        Their provided stats are: ${playerStats}.
        Based *only* on these stats, provide a brief but insightful scout report.
        1.  **Strengths:** What do these numbers suggest are their strong points?
        2.  **Weaknesses/Concerns:** What are the potential red flags or areas of concern?
        3.  **Recommendation:** Give a clear recommendation - should we consider them, reject them, or ask for more information (like gameplay videos)? Justify your recommendation.
        Keep the tone professional and analytical.
    `;
    openModal(`✨ AI Scout Report: ${playerName}`);
    const report = await callGeminiAPI(prompt);
    updateModalContent(report);
}
