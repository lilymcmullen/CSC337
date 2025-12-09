const express = require('express');
const router = express.Router();
const path = require('path');

// GET /register - show registration page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
});

// POST /register - create user in Mongo
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const users = req.app.locals.users;

    // check for duplicate user/email using findOne
    const existingUser = await users.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await users.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const result = await users.insertOne({
      username: username,
      email: email,
      password: password
    });

    // store string id in session so we can compare more easily later
    req.session.userId = result.insertedId.toString();
    req.session.username = username;

    res.json({ success: true, message: 'User registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// GET /login to show login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// POST /login to verify username/password
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = req.app.locals.users;
    const user = await users.findOne({ username: username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check if user is logged in
router.get('/status', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
