const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.sendFile(__dirname + '/../views/register.html');
});


router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const user = new User({ username, email, password });
    await user.save();
    req.session.userId = user._id;
    req.session.username = user.username;
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed. Username or email already exists.' });
  }
});


router.get('/login', (req, res) => {
  res.sendFile(__dirname + '/../views/login.html');
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
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