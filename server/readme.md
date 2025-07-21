# Below is A highlevel List of Routes in the server

1. Authentication Routes (authRoutes.js)
    These routes handle user authentication and session management.

    Key Routes:

    POST /auth/signup: User registration (no JWT required).
    POST /auth/login: User login (returns JWT token).
    POST /auth/logout: User logout (destroy JWT or invalidate session).
    POST /auth/forgot-password: Request for password reset (email sent to user).
    POST /auth/reset-password: Password reset (user submits new password after verification).
    POST /auth/verify-token: Optionally verify JWT token for maintaining session.

2. User-Related Routes (userRoutes.js)
    These routes handle user management and password manager functionalities, which should be protected by JWT (authentication required).

    Key Routes:

    GET /api/user/profile: Get user profile details.
    PUT /api/user/profile: Update user profile information (e.g., username, email).
    POST /api/user/passwords: Store a new password entry (requires JWT).
    GET /api/user/passwords: Get list of passwords for a user (requires JWT).
    GET /api/user/passwords/:id: Get specific password entry (requires JWT).
    PUT /api/user/passwords/:id: Update a specific password entry (requires JWT).
    DELETE /api/user/passwords/:id: Delete a specific password entry (requires JWT).