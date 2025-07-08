const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userSchema');
require('dotenv').config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// In-memory storage for refresh tokens (consider using a database in production)
let refreshTokens = [];

// Sign up endpoint
exports.signup = async (req, res) => {
  const { email, username, googleToken, walletAddress, name, avatarUrl, bio, location } = req.body;

  if (googleToken) {
    try {
      console.time("Google Token Verification");
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.timeEnd("Google Token Verification");

      const payload = ticket.getPayload();
      const googleEmail = payload.email;

      console.time("Database User Lookup");
      let user = await User.findOne({ where: { email: googleEmail } });
      console.timeEnd("Database User Lookup");

      if (!user) {
        user = await User.create({
          email: googleEmail,
          username: username || payload.name || googleEmail,
          name: name || payload.name,
          google_oauth_id: payload.sub,
          walletAddress,
          avatarUrl,
          bio,
          location,
          role: 'user',
        });
        console.time("Database Save New User");
        await user.save();
        console.timeEnd("Database Save New User");
      } else {
        // Update existing user with new optional fields if provided
        await user.update({
          walletAddress: walletAddress || user.walletAddress,
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl,
          bio: bio || user.bio,
          location: location || user.location,
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      refreshTokens.push(refreshToken);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 3600000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 604800000,
      });

      return res.status(201).json({ message: 'Signup successful', userId: user.id, role: user.role });
    } catch (err) {
      console.error("Google OAuth Error:", err);
      return res.status(400).json({ error: 'Invalid Google token' });
    }
  }

  if (walletAddress) {
    try {
      let user = await User.findOne({ where: { walletAddress } });
      if (user) {
        return res.status(400).json({ error: 'User already exists with this wallet address' });
      }

      user = await User.create({
        email: email || `wallet-${walletAddress}@example.com`, // Fallback email if not provided
        username: username || `user-${walletAddress.slice(0, 8)}`,
        walletAddress,
        name,
        avatarUrl,
        bio,
        location,
        role: 'user',
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      refreshTokens.push(refreshToken);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 3600000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 604800000,
      });

      return res.status(201).json({ message: 'Signup successful', userId: user.id, role: user.role });
    } catch (err) {
      console.error("Wallet Signup Error:", err);
      return res.status(500).json({ error: 'Something went wrong during signup' });
    }
  }

  return res.status(400).json({ error: 'Google token or wallet address required' });
};

// Login with Google endpoint
exports.loginWithGoogle = async (req, res) => {
  const { googleToken } = req.body;

  try {
    if (!googleToken) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleEmail = payload.email;

    let user = await User.findOne({ where: { email: googleEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    await user.update({ updatedAt: new Date() });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.push(refreshToken);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 604800000,
    });

    res.status(200).json({ message: 'Google login successful', userId: user.id, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// Login with wallet endpoint
exports.loginWithWallet = async (req, res) => {
  const { walletAddress } = req.body;

  try {
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await User.findOne({ where: { walletAddress } });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    await user.update({ updatedAt: new Date() });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.push(refreshToken);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 604800000,
    });

    res.status(200).json({ message: 'Wallet login successful', userId: user.id, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// Refresh Token endpoint
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error('Error verifying refresh token:', err);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

// Check Authentication endpoint
exports.checkAuth = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      message: 'User is authenticated',
      user: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

// Logout endpoint
exports.logout = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  }
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
};