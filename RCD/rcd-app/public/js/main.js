// filepath: /rcd-app/rcd-app/public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const managerPanelButton = document.getElementById('manager-panel-button');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Handle login form submission (on login.html)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = '';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (!res.ok) {
                    errorMessage.textContent = data.message || 'Login failed';
                    return;
                }
                // Save JWT to localStorage
                if (data.token) {
                    localStorage.setItem('rcd_token', data.token);
                }
                // Redirect to app main page
                window.location.href = '/';
            } catch (err) {
                console.error('Login request failed', err);
                errorMessage.textContent = 'Network error';
            }
        });
    }

    // Fetch current user (if any) and adapt UI
    async function fetchCurrentUser() {
        try {
            const token = localStorage.getItem('rcd_token');
            const res = await fetch('/api/auth/me', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.warn('Could not fetch current user', err);
            return null;
        }
    }

    fetchCurrentUser().then(user => {
        if (!user) return;
        // If user is a team manager, show manager-only UI
        if (user.role === 'team_manager') {
            if (managerPanelButton) managerPanelButton.style.display = 'inline-block';
        }
    });
});