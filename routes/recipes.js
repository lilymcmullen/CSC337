const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const requireLogin = require('../middleware/requireLogin');

// Show recipes page
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../views/recipes.html');
});

// Get all recipes as JSON
router.get('/list', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('userId', 'username');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Show recipe creation form
router.get('/create', (req, res) => {
  res.sendFile(__dirname + '/../views/recipe-form.html');
});

// Create recipe
router.post('/create', requireLogin, async (req, res) => {
  const { title, category, ingredients, instructions, cuisine } = req.body;
  
  try {
    const recipe = new Recipe({
      title,
      category,
      ingredients,
      instructions,
      cuisine,
      userId: req.session.userId
    });
    await recipe.save();
    res.json({ success: true, message: 'Recipe created successfully', recipeId: recipe._id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create recipe' });
  }
});

// View recipe details
router.get('/id/', async (req, res) => {
  try {
    const recipeId = req.query.id;
    const recipe = await Recipe.findById(recipeId).populate('userId', 'username');
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Show edit form
router.get('/edit/', (req, res) => {
  res.sendFile(__dirname + '/../views/recipe-form.html');
});

// Update recipe
router.post('/edit/', requireLogin, async (req, res) => {
  const recipeId = req.query.id;
  const { title, category, ingredients, instructions, cuisine } = req.body;
  
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    if (recipe.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'You cannot edit this recipe' });
    }
    
    recipe.title = title;
    recipe.category = category;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.cuisine = cuisine;
    await recipe.save();
    res.json({ success: true, message: 'Recipe updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe
router.post('/delete/', requireLogin, async (req, res) => {
  const recipeId = req.query.id;
  
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    if (recipe.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'You cannot delete this recipe' });
    }
    
    await Recipe.findByIdAndDelete(recipeId);
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Add review to recipe
router.post('/addReview/', requireLogin, async (req, res) => {
  const recipeId = req.query.id;
  const { reviewText, rating } = req.body;
  
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const review = {
      userId: req.session.userId,
      username: req.session.username,
      reviewText,
      rating: parseInt(rating),
      createdAt: new Date()
    };
    
    recipe.reviews.push(review);
    
    // Calculate average rating
    const totalRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0);
    recipe.rating = (totalRating / recipe.reviews.length).toFixed(1);
    
    await recipe.save();
    res.json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;