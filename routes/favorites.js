const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const requireLogin = require('../middleware/requireLogin');

// GET /favorites - Show favorites page
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../views/my_cookbook.html');
});

// POST /favorites/list - Get user's favorites
router.post('/list', requireLogin, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.session.userId })
      .populate({
        path: 'recipeId',
        populate: { path: 'userId', select: 'username' }
      });
    
    const recipes = favorites.map(fav => fav.recipeId);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /favorites/add - Add to favorites
router.post('/add', requireLogin, async (req, res) => {
  const { recipeId } = req.body;
  
  try {
    const existing = await Favorite.findOne({
      userId: req.session.userId,
      recipeId: recipeId
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' });
    }
    
    const favorite = new Favorite({
      userId: req.session.userId,
      recipeId: recipeId
    });
    await favorite.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// POST /favorites/remove - Remove from favorites
router.post('/remove', requireLogin, async (req, res) => {
  const { recipeId } = req.body;
  
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.session.userId,
      recipeId: recipeId
    });
    
    if (!result) return res.status(404).json({ error: 'Not in favorites' });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;