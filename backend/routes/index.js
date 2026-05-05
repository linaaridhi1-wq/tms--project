const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/utilisateurController');
const clientCtrl = require('../controllers/clientController');
const tenderCtrl = require('../controllers/tenderController');
const submissionCtrl = require('../controllers/submissionController');
const knowledgeCtrl = require('../controllers/knowledgeController');
const statsCtrl = require('../controllers/statsController');
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

// Tenders
router.get('/tenders',        authentifier, autoriser('appel_offre:read'),   tenderCtrl.lister);
router.get('/tenders/:id',    authentifier, autoriser('appel_offre:read'),   tenderCtrl.detail);
router.post('/tenders',       authentifier, autoriser('appel_offre:create'), tenderCtrl.creer);
router.put('/tenders/:id',    authentifier, autoriser('appel_offre:update'), tenderCtrl.modifier);
router.delete('/tenders/:id', authentifier, autoriser('appel_offre:delete'), tenderCtrl.supprimer);

// Submissions
router.get('/submissions',        authentifier, autoriser('appel_offre:read'),   submissionCtrl.lister);
router.get('/submissions/:id',    authentifier, autoriser('appel_offre:read'),   submissionCtrl.detail);
router.post('/submissions',       authentifier, autoriser('appel_offre:create'), submissionCtrl.creer);
router.put('/submissions/:id',    authentifier, autoriser('appel_offre:update'), submissionCtrl.modifier);
router.delete('/submissions/:id', authentifier, autoriser('appel_offre:delete'), submissionCtrl.supprimer);

// Knowledge base
router.get('/knowledge-base',        authentifier, autoriser('appel_offre:read'),   knowledgeCtrl.lister);
router.get('/knowledge-base/:id',    authentifier, autoriser('appel_offre:read'),   knowledgeCtrl.detail);
router.post('/knowledge-base',       authentifier, autoriser('appel_offre:create'), knowledgeCtrl.creer);
router.put('/knowledge-base/:id',    authentifier, autoriser('appel_offre:update'), knowledgeCtrl.modifier);
router.delete('/knowledge-base/:id', authentifier, autoriser('appel_offre:delete'), knowledgeCtrl.supprimer);
router.post('/knowledge-base/:id/use', authentifier, autoriser('appel_offre:update'), knowledgeCtrl.utiliser);

// Stats
router.get('/stats/dashboard', authentifier, autoriser('appel_offre:read'), statsCtrl.dashboard);
router.get('/stats/reports',   authentifier, autoriser('appel_offre:read'), statsCtrl.reports);

module.exports = router;