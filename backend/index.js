const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// ⚠️ adapte si ton fichier DB est différent
const db = require('../db');

router.post('/login', async (req, res) => {

  const { email, motDePasse } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM utilisateurs WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      motDePasse,
      user.mot_de_passe
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    res.json({
      message: "Login OK",
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;