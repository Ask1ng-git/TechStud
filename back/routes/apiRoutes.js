// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/authMiddleware');

// 📥 CRUD principal sur les données COVID



// Ajouter de nouvelles données (auth obligatoire)
router.post('/data', authMiddleware, dataController.addData);

// Mettre à jour des données (auth obligatoire)
router.put('/data/:nomPays', authMiddleware, dataController.updateData);

// Supprimer des données (auth obligatoire)
router.delete('/data/:nomPays', authMiddleware, dataController.deleteData);

// Exporter tout (JSON ou CSV)
router.get('/export/:format', dataController.exportData);

// Exporter un pays spécifique avec colonnes choisies
router.get('/export/:format/:country/:columns*', dataController.exportCountryData);

// Exporter plusieurs pays
router.post('/api/export-multiple/:format', dataController.exportMultipleCountries);

// 🗺️ Gestion des pays

// Liste de tous les pays
router.get('/countries', dataController.getCountries);

// ➕ Ajouter un nouveau pays (auth obligatoire)
router.post('/data/new-country', authMiddleware, dataController.addNewCountryData);

// 🔄 Modifier/Ajouter une journée pour un pays (auth obligatoire)
router.put('/data/day/:nomPays', authMiddleware, dataController.updateCountryDayData);

// 📅 Récupérer toutes les dates existantes pour un pays
router.get('/data/:nomPays/dates', dataController.getAvailableDates);

// 🔍 Récupérer données d'un pays à une date précise
router.get('/data/:nomPays/:date', dataController.getCountryDataByDate);

// Récupérer les données pour un pays
router.get('/data/:nomPays', dataController.getData);

router.delete('/data/:nomPays/:date', authMiddleware, dataController.deleteCountryDayData);

module.exports = router;
