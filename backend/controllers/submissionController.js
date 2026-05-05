const { Submission } = require('../models');

exports.lister = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { actif: true },
      order: [['date_creation', 'DESC']],
    });
    res.json(submissions);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission || submission.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    res.json(submission);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  try {
    const data = {
      titre: req.body.titre?.trim(),
      appel: req.body.appel?.trim(),
      statut: req.body.statut || 'brouillon',
      resultat: req.body.resultat || 'pending',
      score: req.body.score ?? 0,
      date: req.body.date || null,
    };
    const submission = await Submission.create(data);
    res.status(201).json(submission);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission || submission.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await submission.update({
      titre: req.body.titre ?? submission.titre,
      appel: req.body.appel ?? submission.appel,
      statut: req.body.statut ?? submission.statut,
      resultat: req.body.resultat ?? submission.resultat,
      score: req.body.score ?? submission.score,
      date: req.body.date ?? submission.date,
    });
    res.json(submission);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission || submission.actif === false) return res.status(404).json({ message: 'Introuvable.' });
    await submission.update({ actif: false });
    res.json({ message: 'Supprime.' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
