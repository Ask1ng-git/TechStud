const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_key';

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: '🚫 Accès refusé. Token manquant.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: '❌ Token invalide.' });
    }
};
