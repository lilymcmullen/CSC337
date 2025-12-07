const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');
const requireLogin = require('../middleware/requireLogin');

//Show favorites page
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../views/favorites.html');
});

//Get user's favorite recipes
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

//Add recipe to favorites
router.post('/add', requireLogin, async (req, res) => {
  const { recipeId } = req.body;
  
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const existingFavorite = await Favorite.findOne({
      userId: req.session.userId,
      recipeId: recipeId
    });
    
    if (existingFavorite) {
      return res.status(400).json({ error: 'Recipe already in favorites' });
    }
    
    const favorite = new Favorite({
      userId: req.session.userId,
      recipeId: recipeId
    });
    await favorite.save();
    res.json({ success: true, message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

//Remove recipe from favorites
router.post('/remove', requireLogin, async (req, res) => {
  const { recipeId } = req.body;
  
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.session.userId,
      recipeId: recipeId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({ success: true, message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;