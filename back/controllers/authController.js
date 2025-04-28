const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Clé secrète pour JWT
const JWT_SECRET = process.env.JWT_SECRET;


// 🔹 Inscription d'un utilisateur
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifie si l'utilisateur existe déjà
        const userExists = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }

        // Hache le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insère l'utilisateur dans la base
        const newUser = await pool.query(
            'INSERT INTO utilisateurs (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );

        res.status(201).json({ message: '✅ Inscription réussie !', user: newUser.rows[0] });

    } catch (error) {
        console.error('Erreur lors de l’inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// 🔹 Connexion d'un utilisateur
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifie si l'utilisateur existe
        const user = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifie le mot de passe
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Génère un token JWT
        const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: ' Connexion réussie !', token });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
