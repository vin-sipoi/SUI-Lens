const csrf = require('csurf');

// CSRF token generation handler
const csrfTokenHandler = (req, res) => {
  // Generate CSRF token
  const csrfToken = req.csrfToken(); 

  // Set the CSRF token in a cookie (for the frontend to access)
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: true, // Prevents the cookie from being accessed by JavaScript
    secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
    sameSite: 'Lax',
    maxAge: 3600000, // Cookie expiration time (1 hour)
  });

  // Send the CSRF token directly in the response body (optional, depending on your needs)
  res.json({ csrfToken });
};

// CSRF middleware configuration to store the token in a cookie
const csrfProtection = csrf({
  cookie: {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax', 
  },
});

module.exports = { csrfProtection, csrfTokenHandler };
