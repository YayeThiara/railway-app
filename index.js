const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Création automatique de la table users au démarrage
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log(' Table "users" prête.');
  } catch (err) {
    console.error('Erreur lors de la création de la table:', err);
  }
}

// Route par défaut
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Heure actuelle depuis PostgreSQL : ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de connexion à PostgreSQL');
  }
});

// Route pour insérer un utilisateur fictif et afficher tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    await pool.query(`INSERT INTO users (name) VALUES ($1)`, ['Utilisateur Test']);
    const users = await pool.query(`SELECT * FROM users ORDER BY id DESC`);
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la gestion des utilisateurs');
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
