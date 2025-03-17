// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour récupérer des données par pays
router.get('/data/:nomPays', dataController.getData);

// Route pour récupérer la liste des pays disponibles
router.get('/countries', dataController.getCountries);

// Route pour ajouter des données
router.post('/data', dataController.addData);

// Route pour mettre à jour des données
router.put('/data/:nomPays', dataController.updateData); 

// Route pour supprimer des données
router.delete('/data/:nomPays', dataController.deleteData);

// Route pour exporter selon le type (Json,Csv)
router.get('/export/:format', dataController.exportData);

// Route pour exporter selon le type(Json,Csv) et le pays
// Route pour exporter un pays avec des colonnes spécifiques
router.get('/export/:format/:country/:columns*', dataController.exportCountryData);



router.post('/data', authMiddleware, dataController.addData);
router.put('/data/:nomPays', authMiddleware, dataController.updateData);
router.delete('/data/:nomPays', authMiddleware, dataController.deleteData);


module.exports = router;
