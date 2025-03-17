require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Vérifier si les variables d'environnement sont bien définies
if (!process.env.KAGGLE_USERNAME || !process.env.KAGGLE_KEY) {
    console.error("❌ Erreur : KAGGLE_USERNAME ou KAGGLE_KEY est manquant dans .env");
    process.exit(1);
}

// Construire le JSON de configuration
const kaggleConfig = {
    username: process.env.KAGGLE_USERNAME,
    key: process.env.KAGGLE_KEY
};

// Définir le chemin du fichier kaggle.json
const kaggleDir = path.join(require('os').homedir(), '.kaggle');
const kagglePath = path.join(kaggleDir, 'kaggle.json');

// Créer le dossier .kaggle s'il n'existe pas
if (!fs.existsSync(kaggleDir)) {
    fs.mkdirSync(kaggleDir, { recursive: true });
}

// Écrire le fichier kaggle.json avec les bonnes permissions (600 = sécurisé)
fs.writeFileSync(kagglePath, JSON.stringify(kaggleConfig, null, 2), { mode: 0o600 });

console.log("✅ `kaggle.json` a été généré avec succès :", kagglePath);
