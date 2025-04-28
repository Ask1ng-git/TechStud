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
      console.log(` Data found for ${nomPays}:`, result.rows);
      res.json(result.rows);
    } else {
      console.log(` No data found for country: ${nomPays}`);
      res.status(404).json({ message: `Aucune donnée trouvée pour le pays: ${nomPays}` });
    }
  } catch (err) {
    console.error(" Erreur de récupération des données:", err);
    res.status(500).json({ message: "Erreur de récupération des données", error: err });
  }
};

// ✅ Ajouter de nouvelles données
// ✅ Ajouter de nouvelles données (avec vérification doublon)
exports.addData = async (req, res) => {
  const { nomPays, date, total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!nomPays || !date || !total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: '❌ Champs requis manquants.' });
  }

  // ✅ Vérification date future
  const today = new Date();
  const inputDate = new Date(date);

  if (inputDate > today) {
    return res.status(400).json({ message: '❌ Vous ne pouvez pas ajouter une date future.' });
  }

  try {
    // 1. Trouver l'idpays correspondant au nom
    const countryQuery = `SELECT idpays FROM pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    const countryResult = await pool.query(countryQuery, [nomPays]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ message: `❌ Le pays "${nomPays}" n'existe pas.` });
    }

    const idpays = countryResult.rows[0].idpays;

    // 2. Vérifier si une entrée pour (idpays, date) existe déjà
    const checkQuery = `SELECT 1 FROM statistiques_quotidiennes WHERE idpays = $1 AND date = $2`;
    const checkResult = await pool.query(checkQuery, [idpays, date]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: `⚠️ Il existe déjà des données pour "${nomPays}" à la date ${date}.` });
    }

    // 3. Ajouter dans statistiques_quotidiennes
    const insertQuery = `
      INSERT INTO statistiques_quotidiennes (idpays, date, totalcas, totaldeces, totalrecuperes, casactifs)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [idpays, date, total_cases, total_deaths, total_recoveries, total_active_cases];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      message: "✅ Données ajoutées avec succès !",
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error adding data:', err);
    res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};




// ✅ Mettre à jour les données
exports.updateData = async (req, res) => {
  const { nomPays } = req.params;
  const { date, total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!nomPays || !date || !total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: "❌ Champs requis manquants." });
  }

  const today = new Date();
  const inputDate = new Date(date);

  if (inputDate > today) {
    return res.status(400).json({ message: '❌ Vous ne pouvez pas ajouter une date future.' });
  }

  try {
    // 1. Trouver l'idpays correspondant
    const countryQuery = `SELECT idpays FROM pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    const countryResult = await pool.query(countryQuery, [nomPays]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ message: `❌ Le pays "${nomPays}" n'existe pas.` });
    }

    const idpays = countryResult.rows[0].idpays;

    // 2. Upsert (insert si pas existant, update si existant)
    const upsertQuery = `
      INSERT INTO statistiques_quotidiennes (idpays, date, totalcas, totaldeces, totalrecuperes, casactifs)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (idpays, date)
      DO UPDATE SET 
        totalcas = EXCLUDED.totalcas,
        totaldeces = EXCLUDED.totaldeces,
        totalrecuperes = EXCLUDED.totalrecuperes,
        casactifs = EXCLUDED.casactifs
      RETURNING *;
    `;
    const values = [idpays, date, total_cases, total_deaths, total_recoveries, total_active_cases];

    const result = await pool.query(upsertQuery, values);

    res.status(200).json({
      message: "✅ Données ajoutées ou mises à jour avec succès.",
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error updating/adding data:', err);
    res.status(500).json({ message: "Erreur serveur.", error: err });
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

// ✅ Exporter les données pour plusieurs pays
exports.exportMultipleCountries = async (req, res) => {
  const { format } = req.params;
  const { countries, columns } = req.body;

  if (!Array.isArray(countries) || countries.length === 0) {
    return res.status(400).json({ message: "Aucun pays fourni pour l'export." });
  }

  const validColumns = ['nompays', 'total_cases', 'total_deaths', 'total_recoveries', 'total_active_cases'];
  const selectedColumns = columns && columns.length > 0
    ? columns.filter(col => validColumns.includes(col))
    : validColumns;

  try {
    const placeholders = countries.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT ${selectedColumns.join(', ')} FROM statistiques_par_pays WHERE LOWER(TRIM(nompays)) IN (${placeholders})`;

    const result = await pool.query(query, countries);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucune donnée trouvée pour les pays sélectionnés." });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json(result.rows);
    } else if (format === 'csv') {
      const json2csvParser = new Parser({ fields: selectedColumns });
      const csvData = json2csvParser.parse(result.rows);

      res.setHeader('Content-Disposition', 'attachment; filename=export_multiple.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(csvData);
    } else {
      return res.status(400).json({ message: "Format non supporté. Utilisez 'json' ou 'csv'." });
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'exportation multiple:", err);
    res.status(500).json({ message: "Erreur lors de l'exportation multiple.", error: err });
  }
};

// ✅ Ajouter un nouveau pays avec première date
exports.addNewCountryData = async (req, res) => {
  const { nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!nompays || !date || !total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: '❌ Champs requis manquants.' });
  }

  try {
    // Vérifie si le (pays, date) existe déjà
    const check = await pool.query(
      'SELECT 1 FROM donnees_par_jour WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1)) AND date = $2',
      [nompays, date]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ message: `⚠️ Le pays "${nompays}" possède déjà des données pour la date ${date}.` });
    }

    // Sinon, insérer
    const insert = await pool.query(
      `INSERT INTO donnees_par_jour (nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases]
    );

    res.status(201).json({ message: '✅ Données ajoutées avec succès.', data: insert.rows[0] });

  } catch (err) {
    console.error('❌ Erreur ajout pays + date:', err);
    res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};


// ✅ Modifier ou ajouter une journée pour un pays existant
exports.updateCountryDayData = async (req, res) => {
  const { nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases } = req.body;

  if (!nompays || !date || !total_cases || !total_deaths || !total_recoveries || !total_active_cases) {
    return res.status(400).json({ message: '❌ Champs requis manquants.' });
  }

  try {
    const upsert = await pool.query(
      `INSERT INTO donnees_par_jour (nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (nompays, date)
       DO UPDATE SET 
         total_cases = EXCLUDED.total_cases,
         total_deaths = EXCLUDED.total_deaths,
         total_recoveries = EXCLUDED.total_recoveries,
         total_active_cases = EXCLUDED.total_active_cases
       RETURNING *`,
      [nompays, date, total_cases, total_deaths, total_recoveries, total_active_cases]
    );

    res.status(200).json({ message: '✅ Données mises à jour ou ajoutées.', data: upsert.rows[0] });

  } catch (err) {
    console.error('❌ Erreur update jour:', err);
    res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};

// ✅ Récupérer les données d'un pays à une date donnée
exports.getCountryDataByDate = async (req, res) => {
  const { nomPays, date } = req.params;

  try {
    const countryQuery = `SELECT idpays FROM pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    const countryResult = await pool.query(countryQuery, [nomPays]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ message: `❌ Le pays "${nomPays}" n'existe pas.` });
    }

    const idpays = countryResult.rows[0].idpays;

    const dataQuery = `
      SELECT * FROM statistiques_quotidiennes
      WHERE idpays = $1
      AND date = $2
    `;
    const dataResult = await pool.query(dataQuery, [idpays, date]);

    if (dataResult.rows.length === 0) {
      return res.status(404).json({ message: `Aucune donnée pour ${nomPays} à la date ${date}` });
    }

    res.status(200).json(dataResult.rows);

  } catch (err) {
    console.error('❌ Erreur récupération data jour:', err);
    res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};


// ✅ Récupérer toutes les dates existantes pour un pays
exports.getAvailableDates = async (req, res) => {
  const { nomPays } = req.params;

  try {
    const countryQuery = `SELECT idpays FROM pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    const countryResult = await pool.query(countryQuery, [nomPays]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ message: `❌ Le pays "${nomPays}" n'existe pas.` });
    }

    const idpays = countryResult.rows[0].idpays;

    const datesQuery = `SELECT date FROM statistiques_quotidiennes WHERE idpays = $1 ORDER BY date`;
    const datesResult = await pool.query(datesQuery, [idpays]);

    res.status(200).json(datesResult.rows);

  } catch (err) {
    console.error('❌ Erreur lors de la récupération des dates:', err);
    res.status(500).json({ message: "Erreur serveur.", error: err });
  }
};

exports.deleteCountryDayData = async (req, res) => {
  const { nomPays, date } = req.params;

  try {
    const countryQuery = `SELECT idpays FROM pays WHERE LOWER(TRIM(nompays)) = LOWER(TRIM($1))`;
    const countryResult = await pool.query(countryQuery, [nomPays]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ message: `❌ Le pays "${nomPays}" n'existe pas.` });
    }

    const idpays = countryResult.rows[0].idpays;

    const deleteQuery = `
      DELETE FROM statistiques_quotidiennes
      WHERE idpays = $1 AND date::date = $2
    `;

    const result = await pool.query(deleteQuery, [idpays, date]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Aucune donnée trouvée pour ${nomPays} à la date ${date}` });
    }

    res.status(200).json({ message: `✅ Données supprimées.` });

  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    res.status(500).json({ message: 'Erreur serveur.', error: error });
  }
};






