# RCD Esports - Tournament Management Platform

A modern, professional Esports tournament management platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Role-Based Access Control**: Support for Guest, Player, Team Manager, and Admin roles
- **Tournament Management**: Create, browse, and register for tournaments
- **Team System**: Create teams, manage members, and handle join requests
- **My Teams Dashboard**: See teams you manage or belong to; owners can set member roles (Player/Admin)
- **User Dashboard**: Role-specific dashboards with relevant information
- **Admin Panel**: Comprehensive admin tools for managing users, teams, and tournaments
- **Internal System**: Integrated internal admin dashboard available at `/internal/admin/*` (visible only when logged in)
- **Modern UI**: Dark theme with Esports-inspired design and responsive layout

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context + SWR
- **Authentication**: JWT with localStorage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Set up environment variables:

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── internal/          # Integrated Internal System (gated)
│   │   └── admin/         # Internal admin pages (dashboard, tournaments, matches, etc.)
│   ├── admin/             # Admin panel
│   ├── dashboard/         # User dashboard
│   ├── my-teams/          # Personal teams dashboard
│   ├── login/             # Login page
│   ├── profile/           # User profile
│   ├── register/          # Registration page
│   ├── teams/             # Teams pages
│   ├── tournaments/       # Tournaments pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer
│   └── protected-route.tsx # Route protection
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client
│   ├── auth-context.tsx  # Auth context provider
│   └── utils.ts          # Utility functions
└── public/               # Static assets
\`\`\`

## API Integration

The frontend is designed to work with the RCD backend API. All API calls use relative URLs and include JWT authentication in the `Authorization` header.

### API Endpoints

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Tournaments**: `/api/tournaments`, `/api/tournaments/:id`
- **Teams**: `/api/teams`, `/api/teams/:id`
- **Users**: `/api/users/:id`
- **Admin**: `/api/admin/*`

## User Roles

### Guest (Not Logged In)
- View home page and tournaments
- Register/login

### Player
- Join tournaments
- Request to join teams
- View dashboard with personal stats

### Team Manager
- Create and manage teams
- Approve/decline join requests
- Register teams for tournaments
- Manage team members

### Admin
- Full access to all features
- User management (change roles, delete users)
- Team management
- Tournament CRUD operations
- View audit logs

## Test Credentials

When connecting to the backend, use these test accounts:

- **Admin**: `admin@example.com` / `Admin123!`
- **Team Manager**: `manager@example.com` / `Manager123!`
- **Player**: Register a new account

## Design System

The application uses a dark Esports-themed design with:

- **Primary Color**: Purple/Blue gradient
- **Accent Colors**: Neon blue, purple, pink
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: shadcn/ui with custom Esports styling

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js:

\`\`\`bash
npm run build
npm run start
\`\`\`

## Contributing

This is a frontend-only project designed to integrate with the RCD backend. When contributing:

1. Follow the existing code style
2. Use TypeScript for type safety
3. Ensure responsive design works on mobile
4. Test with different user roles

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on the repository.
\`\`\`

```json file="" isHidden
