# RCD Auth Server

## Overview
The RCD Auth Server is a Node.js application that provides authentication functionalities, including user login and registration. It is built using Express and connects to a database to manage user data securely.

## Project Structure
```
rcd-auth-server
├── src
│   ├── server.js                # Entry point of the application
│   ├── controllers               # Contains authentication logic
│   │   └── authController.js     # Handles login and registration requests
│   ├── routes                    # Defines API routes
│   │   └── auth.js               # Routes for authentication
│   ├── models                    # Database models
│   │   └── user.js               # User model definition
│   ├── middleware                # Middleware functions
│   │   └── authMiddleware.js      # Authentication checks
│   └── config                    # Configuration files
│       └── db.js                 # Database connection logic
├── public
│   ├── index.html                # Main HTML file
│   ├── login.html                # Login page HTML
│   ├── js
│   │   └── main.js               # Client-side JavaScript
│   └── css
│       └── styles.css            # CSS styles
├── .env.example                  # Environment variable template
├── package.json                  # NPM configuration
└── README.md                     # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd rcd-auth-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template and fill in the required environment variables.

## Usage
1. Start the server:
   ```
   npm start
   ```

2. Access the application in your browser at `http://localhost:3000`.

## Features
- User registration and login
- Secure authentication using middleware
- Database connection for user data management

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.