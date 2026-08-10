const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const { signToken } = require('../utils/jwt');

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, 
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, 
};


const MAX_AVATAR_LENGTH = 400 * 1024; 

function sendAuthResponse(res, user, statusCode = 200) {
  const token = signToken(user);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(statusCode).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
    },
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are all required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      authProvider: 'local',
    });

    sendAuthResponse(res, user, 201);
  } catch (err) {
    console.error('Register failed:', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    sendAuthResponse(res, user);
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Could not log in' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me — update profile settings (daily new-card limit, avatar)
router.patch('/me', requireAuth, async (req, res) => {
  const { dailyNewCardLimit, avatarUrl } = req.body;

  if (dailyNewCardLimit !== undefined) {
    const limit = Number(dailyNewCardLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      return res.status(400).json({ error: 'Daily new-card limit must be a whole number between 1 and 200' });
    }
    req.user.dailyNewCardLimit = limit;
  }

  if (avatarUrl !== undefined) {
    if (avatarUrl === null || avatarUrl === '') {
      req.user.avatarUrl = undefined; 
    } else {
      if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Avatar must be a valid image' });
      }
      if (avatarUrl.length > MAX_AVATAR_LENGTH) {
        return res.status(400).json({ error: 'Avatar image is too large' });
      }
      req.user.avatarUrl = avatarUrl;
    }
  }

  await req.user.save();
  res.json({ user: req.user });
});

// POST /api/auth/change-password — local accounts only
router.post('/change-password', requireAuth, async (req, res) => {
  if (req.user.authProvider !== 'local') {
    return res.status(400).json({ error: 'Your account uses Google sign-in, so there is no password to change' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are both required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const match = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 12);
  await req.user.save();
  res.json({ success: true });
});

// GET /api/auth/google — kicks off the OAuth consent flow
router.get(
  '/google',
  (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', 
  })
);

// GET /api/auth/google/callback — Google redirects here after consent
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = signToken(req.user);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

module.exports = router;