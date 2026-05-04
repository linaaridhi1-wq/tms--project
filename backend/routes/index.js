const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/utilisateurController');
const clientCtrl = require('../controllers/clientController');
const { authentifier, autoriser, adminSeulement } = require('../middlewares/auth');

// Auth
router.post('/auth/login',   authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.post('/auth/logout',  authentifier, authCtrl.logout);

// Utilisateurs
router.get('/utilisateurs',        authentifier, autoriser('utilisateur:read'), userCtrl.lister);
router.get('/utilisateurs/:id',    authentifier, autoriser('utilisateur:read'), userCtrl.detail);
router.post('/utilisateurs',       authentifier, adminSeulement, userCtrl.creer);
router.put('/utilisateurs/:id',    authentifier, userCtrl.modifier);
router.delete('/utilisateurs/:id', authentifier, adminSeulement, userCtrl.desactiver);

// Clients
router.get('/clients',        authentifier, autoriser('appel_offre:read'),   clientCtrl.lister);
router.get('/clients/:id',    authentifier, autoriser('appel_offre:read'),   clientCtrl.detail);
router.post('/clients',       authentifier, autoriser('appel_offre:create'), clientCtrl.creer);
router.put('/clients/:id',    authentifier, autoriser('appel_offre:update'), clientCtrl.modifier);
router.delete('/clients/:id', authentifier, adminSeulement,                  clientCtrl.supprimer);

module.exports = router;