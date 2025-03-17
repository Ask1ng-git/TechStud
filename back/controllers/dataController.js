// controllers/dataController.js
const { Pool } = require('pg');  
const { Parser } = require('json2csv');
const fs = require('fs');
require('dotenv').config();

// Configurer la connexion PostgreSQL avec .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ✅ Récupérer les données par pays (correction case-sensitive)
exports.getData = async (req, res) => {
  const { nomPays } = req.params;

  const query = `SELECT * FROM statistiques_par_pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
  const values = [nomPays];

  try {
    const result = await pool.query(query, values);
    
    if (result.rows.length > 0) {
      console.log(`✅ Data found for ${nomPays}:`, result.rows);
      res.json(result.rows);
    } else {
      console.log(`❌ No data found for country: ${nomPays}`);
      res.status(404).json({ message: `Aucune donnée trouvée pour le pays: ${nomPays}` });
    }
  } catch (err) {
    console.error("❌ Erreur de récupération des données:", err);
    res.status(500).json({ message: "Erreur de récupération des données", error: err });
  }
};

// ✅ Ajouter de nouvelles données
exports.addData = async (req, res) => {
  const { nomPays, total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!nomPays || !total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO statistiques_par_pays (nompays, total_cases, total_deaths, total_recoveries, total_active_cases)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [nomPays, total_cases, total_deaths, total_recoveries, total_active_cases];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error adding data:', err);
    res.status(500).json({ message: 'Error adding data', error: err });
  }
};

// ✅ Mettre à jour les données
exports.updateData = async (req, res) => {
  const { nomPays } = req.params;
  const { total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: "❌ Missing required fields" });
  }

  try {
    const query = `
      UPDATE statistiques_par_pays 
      SET total_cases = $1, total_deaths = $2, total_recoveries = $3, total_active_cases = $4 
      WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($5)) 
      RETURNING *;
    `;
    const values = [total_cases, total_deaths, total_recoveries, total_active_cases, nomPays];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No data found for country: ${nomPays}` });
    }

    res.status(200).json({
      message: `✅ Data updated for ${nomPays}`,
      updatedData: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error updating data:", err);
    res.status(500).json({ message: "❌ Error updating data", error: err });
  }
};

// ✅ Supprimer des données
exports.deleteData = async (req, res) => {
  const { nomPays } = req.params;

  try {
    const query = `DELETE FROM statistiques_par_pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1)) RETURNING *;`;
    const result = await pool.query(query, [nomPays]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No data found for country: ${nomPays}` });
    }

    res.status(200).json({ message: `Data for country ${nomPays} deleted successfully` });
  } catch (err) {
    console.error('❌ Error deleting data:', err);
    res.status(500).json({ message: 'Error deleting data', error: err });
  }
};

// ✅ Récupérer la liste des pays
exports.getCountries = async (req, res) => {
  try {
    const result = await pool.query('SELECT nompays FROM statistiques_par_pays ORDER BY nompays;');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des pays:', err);
    res.status(500).send('Error fetching countries');
  }
};

// ✅ Exporter toutes les données (JSON ou CSV)
exports.exportData = async (req, res) => {
  const { format } = req.params;

  try {
    const result = await pool.query('SELECT * FROM statistiques_par_pays');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucune donnée disponible à exporter." });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json(result.rows);
    } else if (format === 'csv') {
      const json2csvParser = new Parser({ fields: Object.keys(result.rows[0]) });
      const csvData = json2csvParser.parse(result.rows);

      res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(csvData);
    } else {
      return res.status(400).json({ message: "Format non supporté. Utilisez 'json' ou 'csv'." });
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'exportation des données:", error);
    res.status(500).json({ message: "Erreur lors de l'exportation des données." });
  }
};

// ✅ Exporter les données pour un pays donné
exports.exportCountryData = async (req, res) => {
  let { format, country, columns } = req.params;

  try {
    console.log(`📤 Exportation des données pour '${country}' en format '${format}'...`);

    // Liste des pays qui peuvent être mal formatés
    const countryMappings = {
      "US": "United States",
      "USA": "United States",
      "United-States": "United States",
      "Taiwan*": "Taiwan", // Corrige les erreurs de notation
      "UK": "United Kingdom",
    };

    // Vérifie si le pays est mal formaté et corrige-le
    if (countryMappings[country]) {
      country = countryMappings[country];
    }

    // Vérifie et traite les colonnes
    if (!columns) {
      columns = ['nompays', 'total_cases', 'total_deaths', 'total_recoveries', 'total_active_cases'];
    } else {
      columns = columns.split(',').map(col => col.trim());
    }

    // Vérifie si les colonnes demandées sont valides
    const validColumns = ['nompays', 'total_cases', 'total_deaths', 'total_recoveries', 'total_active_cases'];
    const invalidColumns = columns.filter(col => !validColumns.includes(col));

    if (invalidColumns.length > 0) {
      return res.status(400).json({ message: `Colonnes invalides: ${invalidColumns.join(', ')}` });
    }

    // Construire la requête SQL avec la conversion du nom du pays
    const query = `SELECT ${columns.join(', ')} FROM statistiques_par_pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    console.log(`📝 Requête SQL exécutée: ${query} avec valeur '${country}'`);
    const result = await pool.query(query, [country]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Aucune donnée trouvée pour le pays: ${country}` });
    }

    // Export JSON
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json(result.rows);
    } 
    // Export CSV
    else if (format === 'csv') {
      const json2csvParser = new Parser({ fields: columns });
      const csvData = json2csvParser.parse(result.rows);
      res.setHeader('Content-Disposition', `attachment; filename=${country}_export.csv`);
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(csvData);
    } 
    // Format incorrect
    else {
      return res.status(400).json({ message: "Format non supporté. Utilisez 'json' ou 'csv'." });
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'exportation des données:", error);
    res.status(500).json({ message: "Erreur lors de l'exportation des données." });
  }
};

