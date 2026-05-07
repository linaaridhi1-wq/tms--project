const { sequelize } = require('../models');

// ── helpers ──────────────────────────────────────────────────────────
const safe = (val) => (val === undefined ? null : val);

exports.lister = async (req, res) => {
  try {
    const events = await sequelize.query(
      `SELECT pe.*,
              c.raison_sociale AS client_nom,
              c.secteur        AS client_secteur,
              t.titre          AS tender_titre,
              t.statut         AS tender_statut,
              t.date_limite    AS tender_deadline
       FROM planning_events pe
       LEFT JOIN clients c ON c.client_id = pe.client_id
       LEFT JOIN tenders t ON t.tender_id = pe.tender_id
       WHERE pe.actif = true
       ORDER BY pe.date_debut ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const [event] = await sequelize.query(
      `SELECT pe.*,
              c.raison_sociale AS client_nom,
              t.titre          AS tender_titre
       FROM planning_events pe
       LEFT JOIN clients c ON c.client_id = pe.client_id
       LEFT JOIN tenders t ON t.tender_id = pe.tender_id
       WHERE pe.event_id = :id AND pe.actif = true`,
      { replacements: { id: req.params.id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!event) return res.status(404).json({ message: 'Introuvable.' });
    res.json(event);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  try {
    const { titre, type, date_debut, date_fin, client_id, tender_id, note, couleur } = req.body;
    if (!titre || !date_debut) return res.status(400).json({ message: 'Titre et date_debut requis.' });
    const [rows] = await sequelize.query(
      `INSERT INTO planning_events (titre, type, date_debut, date_fin, client_id, tender_id, note, couleur)
       VALUES (:titre, :type, :date_debut, :date_fin, :client_id, :tender_id, :note, :couleur)
       RETURNING *`,
      {
        replacements: {
          titre: titre.trim(),
          type: type || 'autre',
          date_debut,
          date_fin: safe(date_fin),
          client_id: safe(client_id),
          tender_id: safe(tender_id),
          note: safe(note),
          couleur: couleur || '#7C3AED',
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `UPDATE planning_events
       SET titre      = COALESCE(:titre, titre),
           type       = COALESCE(:type, type),
           date_debut = COALESCE(:date_debut, date_debut),
           date_fin   = :date_fin,
           client_id  = :client_id,
           tender_id  = :tender_id,
           note       = :note,
           couleur    = COALESCE(:couleur, couleur)
       WHERE event_id = :id AND actif = true
       RETURNING *`,
      {
        replacements: {
          id: req.params.id,
          titre: req.body.titre || null,
          type: req.body.type || null,
          date_debut: req.body.date_debut || null,
          date_fin: safe(req.body.date_fin),
          client_id: safe(req.body.client_id),
          tender_id: safe(req.body.tender_id),
          note: safe(req.body.note),
          couleur: req.body.couleur || null,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Introuvable.' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    await sequelize.query(
      `UPDATE planning_events SET actif = false WHERE event_id = :id`,
      { replacements: { id: req.params.id } }
    );
    res.json({ message: 'Supprimé.' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
