# Backend Implementation Checklist

This file lists features that are implemented in the frontend but need corresponding backend endpoints.

## Required Backend Endpoints

### 1. Password Change
**Frontend Implementation:** Profile page has password change form
**Backend Needed:** 
- `POST /api/users/change-password`
- Request body: `{ oldPassword: string, newPassword: string }`
- Response: Success message or error

### 2. Audit Logs
**Frontend Implementation:** Admin panel has "Audit Logs" tab
**Backend Needed:**
- `GET /api/admin/logs`
- Response: Array of log entries with timestamp, user, action, details

### 3. User Management Endpoints
**Frontend Implementation:** Admin panel lists and manages users
**Backend Needed (if not present):**
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Change user role
- `DELETE /api/users/:id` - Delete user

### 4. Team Join Requests
**Frontend Implementation:** Team managers can view and approve join requests
**Backend Endpoints Used:**
- `POST /api/teams/:id/join` - Player requests to join team
- `GET /api/teams/:id/requests` - Get pending join requests
- `POST /api/teams/:id/requests/:reqId/approve` - Approve request
- `POST /api/teams/:id/requests/:reqId/decline` - Decline request
- `DELETE /api/teams/:id/members/:userId` - Remove team member

**Verify these match your backend implementation.**

## Optional Features (Not Implemented)

### 5. Match Management
**Backend Has:** Match model in `models/match.js`
**Missing:** Routes and controllers for matches
**To Add:**
- Match listing, creation, updating
- Match results and scoring
- Frontend pages for match management

### 6. Team Balance
**Backend Has:** `balance` field in Team model
**Missing:** UI and API for managing team balance
**To Add:**
- Display team balance in team detail page
- Add/subtract balance endpoints
- Transaction history

### 7. Real-time Notifications
**Missing:** Notification system for join requests, approvals, etc.
**To Add:**
- WebSocket or polling for real-time updates
- Notification bell in navbar
- Notification list page

## API Endpoint Summary

### Current Frontend API Calls

**Auth:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

**Tournaments:**
- `GET /api/tournaments`
- `GET /api/tournaments/:id`
- `POST /api/tournaments/:id/register`
- `POST /api/tournaments` (admin)
- `PUT /api/tournaments/:id` (admin)
- `DELETE /api/tournaments/:id` (admin)

**Teams:**
- `GET /api/teams`
- `GET /api/teams/:id`
- `POST /api/teams`
- `POST /api/teams/:id/join`
- `GET /api/teams/:id/requests`
- `POST /api/teams/:id/requests/:reqId/approve`
- `POST /api/teams/:id/requests/:reqId/decline`
- `DELETE /api/teams/:id/members/:userId`
- `DELETE /api/teams/:id`

**Users:**
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `POST /api/users/change-password` ⚠️ NEEDS IMPLEMENTATION
- `PATCH /api/users/:id/role`
- `DELETE /api/users/:id`

**Admin:**
- `GET /api/admin/logs` ⚠️ NEEDS IMPLEMENTATION

## Integration Steps

1. Set `NEXT_PUBLIC_API_URL` environment variable to your backend URL
2. Enable CORS on backend for frontend origin
3. Verify JWT token format matches (stored as `rcd_token` in localStorage)
4. Test each endpoint to ensure request/response formats match
5. Implement missing endpoints marked with ⚠️
6. (Optional) Add match management, team balance, and notifications
