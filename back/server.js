const express = require('express');
const cors = require('cors');
const compression = require('compression');  // ✅ Compression des réponses
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config({ path: './.env' });
console.log("🔍 Chargement des variables d'environnement...");
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "OK" : "NON DÉFINI");


const app = express();
const port = 3005;

app.use(cors());
app.use(compression());  // ✅ Active la compression Gzip
app.use(express.json());

// Routes API
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
