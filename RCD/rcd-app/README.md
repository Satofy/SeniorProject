# RCD App

## Overview
The RCD App is a web application designed for managing e-sports data and user authentication. It communicates with external APIs for real-time data and provides a user-friendly interface for users to log in and manage their profiles.

## Project Structure
```
rcd-app
├── src
│   ├── index.js                # Entry point of the application
│   ├── api.js                  # Handles API communication
│   ├── routes
│   │   ├── index.js            # Main application routes
│   │   └── auth.js             # Authentication routes
│   ├── controllers
│   │   └── authController.js    # Authentication logic
│   ├── middleware
│   │   └── authMiddleware.js     # Middleware for authentication
│   ├── models
│   │   └── user.js              # User model and schema
│   └── config
│       └── db.js                # Database connection logic
├── public
│   ├── index.html               # Main HTML file
│   ├── login.html               # Login page HTML
│   ├── css
│   │   └── styles.css           # CSS styles
│   └── js
│       └── main.js              # Frontend JavaScript logic
├── views
│   └── (optional templating files e.g. login.ejs)
├── .env.example                 # Environment variable template
├── package.json                 # NPM configuration file
└── README.md                    # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd rcd-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values, such as database connection strings and API keys.

4. **Run the application:**
   ```
   npm start
   ```

5. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage
- Users can log in through the login page (`public/login.html`).
- The application fetches data from external APIs and displays it in the dashboard.
- User authentication is handled through the defined routes and controllers.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.