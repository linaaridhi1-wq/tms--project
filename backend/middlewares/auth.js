const jwt = require('jsonwebtoken');
exports.authentifier = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Token manquant.' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ message: e.name === 'TokenExpiredError' ? 'Token expire.' : 'Token invalide.', code: e.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID' }); }
};
exports.autoriser = (...p) => (req, res, next) => {
  if (!p.every(x => (req.user?.permissions||[]).includes(x))) return res.status(403).json({ message: 'Acces refuse.' });
  next();
};
exports.adminSeulement = (req, res, next) => {
  if (req.user?.role !== 'Admin') return res.status(403).json({ message: 'Reserve aux admins.' });
  next();
};