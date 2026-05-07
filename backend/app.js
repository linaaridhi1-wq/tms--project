require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// ── Uploads directory (for PDF temp storage) ──────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont acceptés.'));
  },
});

app.locals.upload = upload; // Make upload middleware accessible in routes
app.use(helmet());

// Strict rate limit on auth endpoints only (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed rate limit for all other API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use('/api', apiLimiter, routes);
app.use('/api/auth/login', authLimiter); // stricter limit on login
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne.' });
});
const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.send('API fonctionne 🚀');
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log('Serveur demarre sur le port ' + PORT));
  } catch (err) {
    console.error('Erreur connexion DB:', err.message || err);
    process.exit(1);
  }
};

start();