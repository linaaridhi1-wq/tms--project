const { KnowledgeItem } = require('../models');

exports.lister = async (req, res) => {
  try {
    const items = await KnowledgeItem.findAll({
      where: { actif: true },
      order: [['date_creation', 'DESC']],
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const item = await KnowledgeItem.findByPk(req.params.id);
    if (!item || item.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  try {
    const data = {
      titre: req.body.titre?.trim(),
      categorie: req.body.categorie?.trim(),
      secteur: req.body.secteur || null,
      contenu: req.body.contenu,
      note: req.body.note ?? 5.0,
      usages: req.body.usages ?? 0,
    };
    const item = await KnowledgeItem.create(data);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  try {
    const item = await KnowledgeItem.findByPk(req.params.id);
    if (!item || item.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await item.update({
      titre: req.body.titre ?? item.titre,
      categorie: req.body.categorie ?? item.categorie,
      secteur: req.body.secteur ?? item.secteur,
      contenu: req.body.contenu ?? item.contenu,
      note: req.body.note ?? item.note,
      usages: req.body.usages ?? item.usages,
    });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const item = await KnowledgeItem.findByPk(req.params.id);
    if (!item || item.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await item.update({ actif: false });
    res.json({ message: 'Supprime.' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.utiliser = async (req, res) => {
  try {
    const item = await KnowledgeItem.findByPk(req.params.id);
    if (!item || item.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await item.increment('usages', { by: 1 });
    await item.reload();
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
