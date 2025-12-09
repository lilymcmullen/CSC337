const express = require('express');
const router = express.Router();
const path = require('path');
const { ObjectId } = require('mongodb');
const requireLogin = require('../middleware/requireLogin');

// GET /recipes - show recipes page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'recipes.html'));
});

// GET /recipes/list - list all recipes
router.get('/list', async (req, res) => {
  try {
    const recipes = req.app.locals.recipes;
    const docs = await recipes.find({}).toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /recipes/create
router.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'recipe_form.html'));
});

// POST /recipes/create
router.post('/create', requireLogin, async (req, res) => {
  const { title, ingredients, instructions } = req.body;
  
  try {
    const recipes = req.app.locals.recipes;
    const recipeDoc = {
      title: title,
      ingredients: ingredients,
      instructions: instructions,
      userId: new ObjectId(req.session.userId),
    };

    const result = await recipes.insertOne(recipeDoc);
    res.json({ success: true, recipeId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create recipe' });
  }
});

// GET /recipes/id/?id=# - Get recipe by ID
router.get('/id/', async (req, res) => {
  try {
    const id = req.query.id;
    const recipes = req.app.locals.recipes;

    const recipe = await recipes.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// GET /recipes/edit/?id=# - Show edit form
router.get('/edit/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'recipe_edit_form.html'));
});

// POST /recipes/edit/?id=# - Update recipe (only owner can edit)
router.post('/edit/', requireLogin, async (req, res) => {
  const { title, ingredients, instructions } = req.body;
  const id = req.query.id;

  try {
    const recipes = req.app.locals.recipes;
    const recipe = await recipes.findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipe.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await recipes.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: title,
          ingredients: ingredients,
          instructions: instructions
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update recipe' });
  }
});

// POST /recipes/delete/?id=# - Delete recipe (only owner can)
router.post('/delete/', requireLogin, async (req, res) => {
  const id = req.query.id;

  try {
    const recipes = req.app.locals.recipes;
    const result = await recipes.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(req.session.userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found or not authorized' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

module.exports = router;