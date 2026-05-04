const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Utilisateur, Role, Permission, Session } = require('../models');
const { Op } = require('sequelize');

const REFRESH_EXPIRES = 7 * 24 * 60 * 60 * 1000;

function genToken(user, permissions) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role.libelle, permissions },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

async function loadUserWithPermissions(userId) {
  return await Utilisateur.findOne({
    where: { user_id: userId, actif: true },
    include: [{
      model: Role, as: 'role',
      include: [{ model: Permission, as: 'permissions', attributes: ['code'], through: { attributes: [] } }]
    }],
  });
}

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const user = await Utilisateur.findOne({ where: { email, actif: true } });
    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    // Recharge avec permissions
    const userWithPerms = await loadUserWithPermissions(user.user_id);
    const permissions = userWithPerms.role.permissions.map(p => p.code);

    const refreshToken = uuidv4();
    await Session.create({
      user_id: user.user_id,
      token: refreshToken,
      expires_at: new Date(Date.now() + REFRESH_EXPIRES),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: REFRESH_EXPIRES,
    });

    return res.json({
      accessToken: genToken(userWithPerms, permissions),
      user: {
        userId: user.user_id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: userWithPerms.role.libelle,
        permissions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Token manquant.' });

    const session = await Session.findOne({
      where: { token, revoked: false, expires_at: { [Op.gt]: new Date() } }
    });
    if (!session) return res.status(401).json({ message: 'Session invalide.' });

    const userWithPerms = await loadUserWithPermissions(session.user_id);
    if (!userWithPerms) return res.status(401).json({ message: 'Inactif.' });

    const permissions = userWithPerms.role.permissions.map(p => p.code);
    return res.json({ accessToken: genToken(userWithPerms, permissions) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await Session.update({ revoked: true }, { where: { token } });
    res.clearCookie('refreshToken');
    return res.json({ message: 'Deconnexion.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};