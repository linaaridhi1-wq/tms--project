const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const Role        = require('./Role')(sequelize);
const Permission  = require('./Permission')(sequelize);
const Utilisateur = require('./Utilisateur')(sequelize);
const Session     = require('./Session')(sequelize);
const Client      = require('./Client')(sequelize);
const Tender      = require('./Tender')(sequelize);
const Submission  = require('./Submission')(sequelize);
const KnowledgeItem      = require('./KnowledgeItem')(sequelize);
const TenderAiAnalysis   = require('./TenderAiAnalysis')(sequelize);
const TenderScore        = require('./TenderScore')(sequelize);

const models = { Role, Permission, Utilisateur, Session, Client, Tender, Submission, KnowledgeItem, TenderAiAnalysis, TenderScore, sequelize, Sequelize };

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = models;