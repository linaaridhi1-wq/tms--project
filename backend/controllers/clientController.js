const { Client } = require('../models');

exports.lister = async (req, res) => {
  try {
    const clients = await Client.findAll({ where: { actif: true }, order: [['raison_sociale', 'ASC']] });
    res.json(clients);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

exports.detail = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    res.json(client);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

exports.creer = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

exports.modifier = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await client.update(req.body);
    res.json(client);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
};

exports.supprimer = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await client.update({ actif: false });
    res.json({ message: 'Client désactivé.' });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
};