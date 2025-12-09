const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const requireLogin = require('../middleware/requireLogin');

// GET /recipes
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../views/recipes.html');
});

// GET /recipes/list - Get all recipes
router.get('/list', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('userId', 'username');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /recipes/create
router.get('/create', (req, res) => {
  res.sendFile(__dirname + '/../views/recipe_form.html');
});

// POST /recipes/create
router.post('/create', requireLogin, async (req, res) => {
  const { title, category, ingredients, instructions, cuisine } = req.body;
  
  try {
    const recipe = new Recipe({
      title, category, ingredients, instructions, cuisine,
      userId: req.session.userId
    });
    await recipe.save();
    res.json({ success: true, recipeId: recipe._id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create recipe' });
  }
});

// GET /recipes/id/?id=# - Get recipe by ID
router.get('/id/', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.query.id).populate('userId', 'username');
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// GET /recipes/edit/?id=# - Show edit form
router.get('/edit/', (req, res) => {
  res.sendFile(__dirname + '/../views/recipe_edit_form.html');
});

// POST /recipes/edit/?id=# - Update recipe
router.post('/edit/', requireLogin, async (req, res) => {
  const { title, category, ingredients, instructions, cuisine } = req.body;
  
  try {
    const recipe = await Recipe.findById(req.query.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    recipe.title = title;
    recipe.category = category;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.cuisine = cuisine;
    await recipe.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update recipe' });
  }
});

// POST /recipes/delete/?id=# - Delete recipe
router.post('/delete/', requireLogin, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.query.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Recipe.findByIdAndDelete(req.query.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// POST /recipes/addReview/?id=# - Add review
router.post('/addReview/', requireLogin, async (req, res) => {
  const { reviewText, rating } = req.body;
  
  try {
    const recipe = await Recipe.findById(req.query.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    
    recipe.reviews.push({
      userId: req.session.userId,
      username: req.session.username,
      reviewText,
      rating: parseInt(rating)
    });
    
    const totalRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0);
    recipe.rating = (totalRating / recipe.reviews.length).toFixed(1);
    
    await recipe.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;