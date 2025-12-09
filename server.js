
const express = require('express');
const session = require('express-session');
const path = require('path');
const { MongoClient } = require('mongodb');

const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');

const app = express();

// data setup, parse json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session setup
app.use(session({
  secret: 'someSecretKey',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'views')));

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function start() {
  try {
    await client.connect();
    const db = client.db('recipeApp');

    app.locals.users = db.collection('users');
    app.locals.recipes = db.collection('recipes');
    app.locals.favorites = db.collection('favorites');

    // mount routes
    app.use('/', userRoutes);          // /register, /login
    app.use('/recipes', recipeRoutes);
    app.use('/favorites', favoriteRoutes);

    // home page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'views/index.html'));
    });

    app.listen(8080, () => {
      console.log('Server running on http://localhost:8080');
    });
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

start();
