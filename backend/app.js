require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use('/api', routes);
app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne.' });
});
const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.send('API fonctionne 🚀');
});
app.listen(PORT, () => console.log('Serveur demarre sur le port ' + PORT));