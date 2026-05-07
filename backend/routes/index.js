const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/utilisateurController');
const clientCtrl = require('../controllers/clientController');
const tenderCtrl = require('../controllers/tenderController');
const submissionCtrl = require('../controllers/submissionController');
const knowledgeCtrl = require('../controllers/knowledgeController');
const statsCtrl = require('../controllers/statsController');
const planningCtrl = require('../controllers/planningController');
const aiCtrl = require('../controllers/aiController');
const { authentifier, autoriser, adminSeulement } = require('../middlewares/auth');
const { Role } = require('../models');

// ── Auth ─────────────────────────────────────────────────────────────
router.post('/auth/login',   authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.post('/auth/logout',  authentifier, authCtrl.logout);

// ── Roles (for dropdowns) ─────────────────────────────────────────────
router.get('/roles', authentifier, async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['role_id', 'ASC']] });
    res.json(roles);
  } catch (e) {
    res.status(500).json({ message: 'Erreur.' });
  }
});

// ── Utilisateurs (Admin only for write) ──────────────────────────────
router.get('/utilisateurs',        authentifier, autoriser('utilisateur:read'), userCtrl.lister);
router.get('/utilisateurs/:id',    authentifier, autoriser('utilisateur:read'), userCtrl.detail);
router.post('/utilisateurs',       authentifier, adminSeulement, userCtrl.creer);
router.put('/utilisateurs/:id',    authentifier, adminSeulement, userCtrl.modifier);
router.delete('/utilisateurs/:id', authentifier, adminSeulement, userCtrl.desactiver);

// ── Clients ───────────────────────────────────────────────────────────
router.get('/clients',        authentifier, autoriser('appel_offre:read'),   clientCtrl.lister);
router.get('/clients/:id',    authentifier, autoriser('appel_offre:read'),   clientCtrl.detail);
router.post('/clients',       authentifier, autoriser('appel_offre:create'), clientCtrl.creer);
router.put('/clients/:id',    authentifier, autoriser('appel_offre:update'), clientCtrl.modifier);
router.delete('/clients/:id', authentifier, adminSeulement,                  clientCtrl.supprimer);

// ── Tenders ───────────────────────────────────────────────────────────
router.get('/tenders',        authentifier, autoriser('appel_offre:read'),   tenderCtrl.lister);
router.get('/tenders/:id',    authentifier, autoriser('appel_offre:read'),   tenderCtrl.detail);
router.post('/tenders',       authentifier, autoriser('appel_offre:create'), tenderCtrl.creer);
router.put('/tenders/:id',    authentifier, autoriser('appel_offre:update'), tenderCtrl.modifier);
router.delete('/tenders/:id', authentifier, autoriser('appel_offre:delete'), tenderCtrl.supprimer);

// ── Submissions ───────────────────────────────────────────────────────
router.get('/submissions',        authentifier, autoriser('appel_offre:read'),   submissionCtrl.lister);
router.get('/submissions/:id',    authentifier, autoriser('appel_offre:read'),   submissionCtrl.detail);
router.post('/submissions',       authentifier, autoriser('appel_offre:create'), submissionCtrl.creer);
router.put('/submissions/:id',    authentifier, autoriser('appel_offre:update'), submissionCtrl.modifier);
router.delete('/submissions/:id', authentifier, autoriser('appel_offre:delete'), submissionCtrl.supprimer);

// ── Knowledge base ────────────────────────────────────────────────────
router.get('/knowledge-base',          authentifier, autoriser('appel_offre:read'),   knowledgeCtrl.lister);
router.get('/knowledge-base/:id',      authentifier, autoriser('appel_offre:read'),   knowledgeCtrl.detail);
router.post('/knowledge-base',         authentifier, autoriser('appel_offre:create'), knowledgeCtrl.creer);
router.put('/knowledge-base/:id',      authentifier, autoriser('appel_offre:update'), knowledgeCtrl.modifier);
router.delete('/knowledge-base/:id',   authentifier, autoriser('appel_offre:delete'), knowledgeCtrl.supprimer);
router.post('/knowledge-base/:id/use', authentifier, autoriser('appel_offre:update'), knowledgeCtrl.utiliser);

// ── Planning ──────────────────────────────────────────────────────────
router.get('/planning',        authentifier, autoriser('planning:read'),  planningCtrl.lister);
router.get('/planning/:id',    authentifier, autoriser('planning:read'),  planningCtrl.detail);
router.post('/planning',       authentifier, autoriser('planning:write'), planningCtrl.creer);
router.put('/planning/:id',    authentifier, autoriser('planning:write'), planningCtrl.modifier);
router.delete('/planning/:id', authentifier, autoriser('planning:write'), planningCtrl.supprimer);

// ── Stats ─────────────────────────────────────────────────────────────
router.get('/stats/dashboard', authentifier, autoriser('appel_offre:read'), statsCtrl.dashboard);
router.get('/stats/reports',   authentifier, autoriser('appel_offre:read'), statsCtrl.reports);

// ── AI Analysis ───────────────────────────────────────────────────────
router.post(
  '/tenders/:id/analyze',
  authentifier,
  autoriser('appel_offre:read'),
  (req, res, next) => {
    const upload = req.app.locals.upload;
    upload.single('pdf')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  aiCtrl.analyze,
);
router.get('/tenders/:id/analysis', authentifier, autoriser('appel_offre:read'), aiCtrl.getAnalysis);
router.get('/tenders/:id/score',    authentifier, autoriser('appel_offre:read'), aiCtrl.getScore);
router.get('/ai/history',           authentifier, autoriser('appel_offre:read'), aiCtrl.getHistory);

module.exports = router;