const express = require('express');
const router = express.Router();
const path = require('path');
const { ObjectId } = require('mongodb');
const requireLogin = require('../middleware/requireLogin');

// GET /favorites - show favorites page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'my_cookbook.html'));
});

// POST /favorites/list - get user's favorite recipes
router.post('/list', requireLogin, async (req, res) => {
  try {
    const favorites = req.app.locals.favorites;
    const recipes = req.app.locals.recipes;

    const userId = new ObjectId(req.session.userId);
    const favDocs = await favorites.find({ userId: userId }).toArray();

    const recipeList = [];
    for (const fav of favDocs) {
      const recipe = await recipes.findOne({ _id: fav.recipeId });
      if (recipe) {
        recipeList.push(recipe);
      }
    }

    res.json(recipeList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /favorites/add - add a recipe to favorites
router.post('/add', requireLogin, async (req, res) => {
  const { recipeId } = req.body;

  try {
    const favorites = req.app.locals.favorites;

    const userId = new ObjectId(req.session.userId);
    const recipeObjectId = new ObjectId(recipeId);

    const existing = await favorites.findOne({
      userId: userId,
      recipeId: recipeObjectId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    await favorites.insertOne({
      userId: userId,
      recipeId: recipeObjectId
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// POST /favorites/remove - remove from favorites
router.post('/remove', requireLogin, async (req, res) => {
  const { recipeId } = req.body;

  try {
    const favorites = req.app.locals.favorites;

    const userId = new ObjectId(req.session.userId);
    const recipeObjectId = new ObjectId(recipeId);

    const result = await favorites.deleteOne({
      userId: userId,
      recipeId: recipeObjectId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not in favorites' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
