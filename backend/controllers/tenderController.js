const { Tender } = require('../models');

exports.lister = async (req, res) => {
  try {
    const tenders = await Tender.findAll({
      where: { actif: true },
      order: [['date_creation', 'DESC']],
    });
    res.json(tenders);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    if (!tender || tender.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    res.json(tender);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  try {
    const data = {
      titre: req.body.titre?.trim(),
      client: req.body.client?.trim(),
      statut: req.body.statut || 'detecte',
      date_limite: req.body.date_limite || null,
      budget: req.body.budget || null,
      responsable: req.body.responsable || null,
      description: req.body.description || null,
    };
    const tender = await Tender.create(data);
    res.status(201).json(tender);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    if (!tender || tender.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await tender.update({
      titre: req.body.titre ?? tender.titre,
      client: req.body.client ?? tender.client,
      statut: req.body.statut ?? tender.statut,
      date_limite: req.body.date_limite ?? tender.date_limite,
      budget: req.body.budget ?? tender.budget,
      responsable: req.body.responsable ?? tender.responsable,
      description: req.body.description ?? tender.description,
    });
    res.json(tender);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    if (!tender || tender.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await tender.update({ actif: false });
    res.json({ message: 'Supprime.' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
