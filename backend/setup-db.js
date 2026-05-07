/**
 * ============================================================
 * YELLOMIND TMS — Full Database Setup Script
 * ============================================================
 * Runs: sync all tables + seed roles + seed permissions + seed all users
 * Usage: node setup-db.js
 *
 * LOGIN CREDENTIALS
 * ─────────────────────────────────────────────
 * Admin      : admin@yellomind.com     / Admin2025!
 * Manager    : manager@yellomind.com   / Manager2025!
 * Consultant : consultant@yellomind.com / Consultant2025!
 * ─────────────────────────────────────────────
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// ---- Model definitions (inline) ----
const { DataTypes } = Sequelize;

const Role = sequelize.define('Role', {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  libelle: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { tableName: 'roles', timestamps: false });

const Permission = sequelize.define('Permission', {
  permission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code:          { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description:   { type: DataTypes.STRING(255) },
}, { tableName: 'permissions', timestamps: false });

const RolePermission = sequelize.define('RolePermission', {
  role_id:       { type: DataTypes.INTEGER, allowNull: false },
  permission_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'role_permissions', timestamps: false });

const Utilisateur = sequelize.define('Utilisateur', {
  user_id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom:          { type: DataTypes.STRING(100), allowNull: false },
  prenom:       { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(255), allowNull: false, unique: true },
  mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
  role_id:      { type: DataTypes.INTEGER, allowNull: false },
  actif:        { type: DataTypes.BOOLEAN, defaultValue: true },
  date_creation:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'utilisateurs', timestamps: false });

const Session = sequelize.define('Session', {
  session_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  token:      { type: DataTypes.STRING(512), allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'sessions', timestamps: false });

const Client = sequelize.define('Client', {
  client_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  raison_sociale:{ type: DataTypes.STRING(255), allowNull: false },
  secteur:       { type: DataTypes.STRING(100) },
  contact:       { type: DataTypes.STRING(255) },
  email:         { type: DataTypes.STRING(255) },
  telephone:     { type: DataTypes.STRING(20) },
  pays:          { type: DataTypes.STRING(100) },
  site_web:      { type: DataTypes.STRING(255) },
  notes:         { type: DataTypes.TEXT },
  actif:         { type: DataTypes.BOOLEAN, defaultValue: true },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'clients', timestamps: false });

// ---- Seed data ----
const ROLES = [
  { role_id: 1, libelle: 'Admin' },
  { role_id: 2, libelle: 'Manager' },
  { role_id: 3, libelle: 'Consultant' },
];

const PERMISSIONS = [
  { code: 'appel_offre:read',    description: 'Voir les appels d offres' },
  { code: 'appel_offre:create',  description: 'Creer un appel d offres' },
  { code: 'appel_offre:update',  description: 'Modifier un appel d offres' },
  { code: 'appel_offre:delete',  description: 'Supprimer un appel d offres' },
  { code: 'utilisateur:read',    description: 'Voir les utilisateurs' },
  { code: 'utilisateur:create',  description: 'Creer un utilisateur' },
  { code: 'client:read',         description: 'Voir les clients' },
  { code: 'client:create',       description: 'Creer un client' },
  { code: 'planning:read',       description: 'Voir le planning' },
  { code: 'planning:write',      description: 'Creer/modifier des evenements planning' },
];

// Admin gets ALL permissions
const ADMIN_PERMISSIONS = PERMISSIONS.map(p => p.code);
// Manager gets broad access (no user management)
const MANAGER_PERMISSIONS = [
  'appel_offre:read', 'appel_offre:create', 'appel_offre:update', 'appel_offre:delete',
  'client:read', 'client:create',
  'planning:read', 'planning:write',
];
// Consultant gets read only
const CONSULTANT_PERMISSIONS = ['appel_offre:read', 'planning:read'];

const DEMO_USERS = [
  { nom: 'Admin', prenom: 'Yellomind', email: 'admin@yellomind.com', password: 'Admin2025!', role_id: 1 },
  { nom: 'Benali', prenom: 'Karim', email: 'manager@yellomind.com', password: 'Manager2025!', role_id: 2 },
  { nom: 'Meziane', prenom: 'Sara', email: 'consultant@yellomind.com', password: 'Consultant2025!', role_id: 3 },
];

const log = (msg, ok = true) => console.log(`${ok ? '✅' : '❌'} ${msg}`);
const sep = () => console.log('─'.repeat(60));

// ---- Main ----
(async () => {
  sep();
  console.log('  YELLOMIND TMS — Database Setup');
  sep();

  try {
    // 1. Test connection
    await sequelize.authenticate();
    log('Connexion PostgreSQL réussie');

    // 2. Create tables manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        libelle VARCHAR(50) NOT NULL UNIQUE
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        permission_id SERIAL PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255)
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        user_id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        mot_de_passe VARCHAR(255) NOT NULL,
        role_id INTEGER NOT NULL REFERENCES roles(role_id),
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES utilisateurs(user_id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS clients (
        client_id SERIAL PRIMARY KEY,
        raison_sociale VARCHAR(255) NOT NULL,
        secteur VARCHAR(100),
        contact VARCHAR(255),
        email VARCHAR(255),
        telephone VARCHAR(20),
        pays VARCHAR(100),
        site_web VARCHAR(255),
        notes TEXT,
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        tender_id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        client VARCHAR(255),
        client_id INTEGER REFERENCES clients(client_id) ON DELETE SET NULL,
        date_limite TIMESTAMPTZ,
        budget VARCHAR(100),
        statut VARCHAR(50) DEFAULT 'detecte',
        description TEXT,
        responsable VARCHAR(255),
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        appel VARCHAR(255),
        tender_id INTEGER REFERENCES tenders(tender_id) ON DELETE SET NULL,
        statut VARCHAR(50) DEFAULT 'brouillon',
        resultat VARCHAR(50) DEFAULT 'pending',
        score INTEGER DEFAULT 0,
        date TIMESTAMPTZ,
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS knowledge_items (
        item_id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        categorie VARCHAR(100),
        secteur VARCHAR(100),
        contenu TEXT,
        note DECIMAL(3,1) DEFAULT 5.0,
        usages INTEGER DEFAULT 0,
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS planning_events (
        event_id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'autre',
        date_debut TIMESTAMPTZ NOT NULL,
        date_fin TIMESTAMPTZ,
        client_id INTEGER REFERENCES clients(client_id) ON DELETE SET NULL,
        tender_id INTEGER REFERENCES tenders(tender_id) ON DELETE SET NULL,
        note TEXT,
        couleur VARCHAR(20) DEFAULT '#7C3AED',
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    log('Tables créées / vérifiées (incl. planning_events)');

    // 3. Seed Roles (upsert by libelle)
    for (const role of ROLES) {
      await sequelize.query(
        `INSERT INTO roles (role_id, libelle) VALUES (:role_id, :libelle)
         ON CONFLICT (role_id) DO UPDATE SET libelle = :libelle`,
        { replacements: role }
      );
    }
    log('Rôles insérés (Admin, Manager, Consultant)');

    // 4. Seed Permissions
    for (const perm of PERMISSIONS) {
      await sequelize.query(
        `INSERT INTO permissions (code, description) VALUES (:code, :description)
         ON CONFLICT (code) DO NOTHING`,
        { replacements: perm }
      );
    }
    log('Permissions insérées (' + PERMISSIONS.length + ')');

    // 5. Assign permissions to roles
    const permRows = await sequelize.query(
      `SELECT permission_id, code FROM permissions`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const permMap = {};
    permRows.forEach(p => { permMap[p.code] = p.permission_id; });

    const rolePermAssignments = [
      ...ADMIN_PERMISSIONS.map(code => ({ role_id: 1, permission_id: permMap[code] })),
      ...MANAGER_PERMISSIONS.map(code => ({ role_id: 2, permission_id: permMap[code] })),
      ...CONSULTANT_PERMISSIONS.map(code => ({ role_id: 3, permission_id: permMap[code] })),
    ].filter(r => r.permission_id);

    for (const rp of rolePermAssignments) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)
         ON CONFLICT DO NOTHING`,
        { replacements: rp }
      );
    }
    log('Permissions assignées aux rôles');

    // 6. Seed demo users (all 3 roles)
    for (const u of DEMO_USERS) {
      const hash = await bcrypt.hash(u.password, 12);
      await sequelize.query(`DELETE FROM sessions WHERE user_id = (SELECT user_id FROM utilisateurs WHERE email = :email)`, { replacements: { email: u.email } });
      await sequelize.query(`DELETE FROM utilisateurs WHERE email = :email`, { replacements: { email: u.email } });
      await sequelize.query(
        `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role_id, actif)
         VALUES (:nom, :prenom, :email, :hash, :role_id, true)`,
        { replacements: { ...u, hash } }
      );
    }
    log('3 utilisateurs créés (Admin, Manager, Consultant)');

    // 7. Seed demo clients
    const demoClients = [
      { raison_sociale: 'Ministère du Travail', secteur: 'Secteur public', pays: 'Algérie', email: 'contact@mtravail.dz' },
      { raison_sociale: "Banque Nationale d'Algérie", secteur: 'Banque & Finance', pays: 'Algérie', email: 'dsi@bna.dz' },
      { raison_sociale: 'Groupe Cevital', secteur: 'Industrie', pays: 'Algérie', email: 'achats@cevital.dz' },
      { raison_sociale: 'Sonatrach Digital', secteur: 'Énergie', pays: 'Algérie', email: 'it@sonatrach.dz' },
      { raison_sociale: 'Ooredoo Algérie', secteur: 'Télécommunications', pays: 'Algérie', email: 'procurement@ooredoo.dz' },
    ];
    for (const c of demoClients) {
      await sequelize.query(
        `INSERT INTO clients (raison_sociale, secteur, pays, email)
         VALUES (:raison_sociale, :secteur, :pays, :email)
         ON CONFLICT DO NOTHING`,
        { replacements: c }
      );
    }
    log('5 clients de démonstration insérés');

    // 8. Seed demo tenders
    const demoTenders = [
      { titre: 'Développement Portail RH', client: 'Ministère du Travail', statut: 'en_cours', date_limite: new Date(Date.now() + 12 * 86400000).toISOString(), budget: '1 500 000 DA', responsable: 'Karim Benali', description: 'Portail de gestion RH pour 500 agents' },
      { titre: 'Audit Sécurité SI', client: "Banque Nationale d'Algérie", statut: 'qualifie', date_limite: new Date(Date.now() + 5 * 86400000).toISOString(), budget: '800 000 DA', responsable: 'Sara Meziane', description: 'Audit complet du système d\'information' },
      { titre: 'Plateforme ERP Industriel', client: 'Groupe Cevital', statut: 'soumis', date_limite: new Date(Date.now() - 2 * 86400000).toISOString(), budget: '3 200 000 DA', responsable: 'Karim Benali', description: 'Déploiement ERP SAP pour usines' },
      { titre: 'Application Mobile Terrain', client: 'Sonatrach Digital', statut: 'gagne', date_limite: new Date(Date.now() + 30 * 86400000).toISOString(), budget: '950 000 DA', responsable: 'Sara Meziane', description: 'App mobile pour techniciens terrain' },
      { titre: 'Infra Cloud Migration', client: 'Ooredoo Algérie', statut: 'detecte', date_limite: new Date(Date.now() + 20 * 86400000).toISOString(), budget: '2 100 000 DA', responsable: 'Karim Benali', description: 'Migration vers AWS / Azure' },
    ];
    for (const t of demoTenders) {
      await sequelize.query(
        `INSERT INTO tenders (titre, client, statut, date_limite, budget, responsable, description)
         VALUES (:titre, :client, :statut, :date_limite, :budget, :responsable, :description)
         ON CONFLICT DO NOTHING`,
        { replacements: t }
      );
    }
    log('5 appels d\'offres de démonstration insérés');

    // 9. Seed demo submissions
    const demoSubmissions = [
      { titre: 'Proposition Portail RH v1', appel: 'Développement Portail RH', statut: 'soumis', resultat: 'pending', score: 82, date: new Date().toISOString() },
      { titre: 'Offre Audit Sécurité', appel: 'Audit Sécurité SI', statut: 'en_revision', resultat: 'pending', score: 67, date: new Date().toISOString() },
      { titre: 'Soumission ERP Cevital', appel: 'Plateforme ERP Industriel', statut: 'soumis', resultat: 'perdu', score: 55, date: new Date(Date.now() - 10 * 86400000).toISOString() },
      { titre: 'App Mobile Sonatrach v2', appel: 'Application Mobile Terrain', statut: 'soumis', resultat: 'gagne', score: 91, date: new Date(Date.now() - 15 * 86400000).toISOString() },
    ];
    for (const s of demoSubmissions) {
      await sequelize.query(
        `INSERT INTO submissions (titre, appel, statut, resultat, score, date)
         VALUES (:titre, :appel, :statut, :resultat, :score, :date)
         ON CONFLICT DO NOTHING`,
        { replacements: s }
      );
    }
    log('4 soumissions de démonstration insérées');

    // 10. Seed demo knowledge items
    const demoKnowledge = [
      { titre: 'Résumé exécutif — Projets IT publics', categorie: 'Résumé exécutif', secteur: 'Secteur public', contenu: 'Notre société, forte de 10 ans d\'expertise dans les projets informatiques publics, propose une solution éprouvée, livrée dans les délais et certifiée ISO 9001. Nos références incluent 15+ ministères et organismes publics algériens.', note: 4.8, usages: 12 },
      { titre: 'Méthodologie Agile / SCRUM', categorie: 'Méthodologie', secteur: 'IT', contenu: 'Nous adoptons la méthodologie Agile SCRUM avec des sprints de 2 semaines, des revues hebdomadaires avec le client, et une livraison continue. Chaque sprint produit un incrément fonctionnel validé.', note: 4.5, usages: 8 },
      { titre: 'Clause de garantie standard', categorie: 'Offre commerciale', secteur: 'Tous secteurs', contenu: 'Une garantie de 12 mois sur l\'ensemble des livrables est incluse. Durant cette période, tout défaut de conformité est corrigé sans frais additionnels dans un délai de 5 jours ouvrés.', note: 4.2, usages: 20 },
      { titre: 'Références — Secteur bancaire', categorie: 'Références', secteur: 'Banque & Finance', contenu: 'BNA (2023) — Audit Sécurité SI, CPA (2022) — Core Banking Migration, Société Générale Algérie (2024) — Portail Client Digital. Contacts disponibles sur demande.', note: 4.7, usages: 5 },
    ];
    for (const k of demoKnowledge) {
      await sequelize.query(
        `INSERT INTO knowledge_items (titre, categorie, secteur, contenu, note, usages)
         VALUES (:titre, :categorie, :secteur, :contenu, :note, :usages)
         ON CONFLICT DO NOTHING`,
        { replacements: k }
      );
    }
    log('4 éléments base de savoirs insérés');

    // 11. Seed demo planning events
    const now = new Date();
    const demoEvents = [
      { titre: 'Réunion kick-off Portail RH', type: 'reunion', date_debut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 0).toISOString(), note: 'Présence requise du chef de projet', couleur: '#7C3AED' },
      { titre: 'Date limite Audit Sécurité SI', type: 'echeance', date_debut: new Date(Date.now() + 5 * 86400000).toISOString(), note: 'Dépôt des offres avant 16h00', couleur: '#EF4444' },
      { titre: 'Présentation ERP Cevital', type: 'presentation', date_debut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 14, 0).toISOString(), note: 'Salle de conférence — 3ème étage', couleur: '#F59E0B' },
      { titre: 'Suivi contrat App Mobile', type: 'suivi', date_debut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 10, 0).toISOString(), note: 'Revue mensuelle du contrat', couleur: '#10B981' },
      { titre: 'Qualification AO Cloud', type: 'qualification', date_debut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0).toISOString(), note: 'Analyse des exigences techniques', couleur: '#3B82F6' },
    ];
    for (const e of demoEvents) {
      await sequelize.query(
        `INSERT INTO planning_events (titre, type, date_debut, note, couleur)
         VALUES (:titre, :type, :date_debut, :note, :couleur)`,
        { replacements: e }
      );
    }
    log('5 événements planning insérés');

    sep();
    console.log('');
    console.log('  🎉  BASE DE DONNÉES PRÊTE !');
    console.log('');
    console.log('  ┌──────────────────────────────────────────────────┐');
    console.log('  │           CREDENTIALS DE CONNEXION               │');
    console.log('  ├──────────────────────────────────────────────────┤');
    console.log('  │  Admin      : admin@yellomind.com / Admin2025!   │');
    console.log('  │  Manager    : manager@yellomind.com / Manager2025!│');
    console.log('  │  Consultant : consultant@yellomind.com / Consultant2025! │');
    console.log('  └──────────────────────────────────────────────────┘');
    console.log('');
    sep();

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('❌ ERREUR COMPLÈTE :');
    console.dir(err, { depth: null });
    const msg = (err.message || '') + (err.original?.message || '') + (err.code || '');
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      console.error('  CAUSE : PostgreSQL ne tourne pas ou n\'est pas installé.');
    } else if (msg.includes('password') || msg.includes('authentication')) {
      console.error('  CAUSE : Mot de passe incorrect. Vérifiez DATABASE_URL dans .env');
    } else if (msg.includes('does not exist')) {
      console.error('  CAUSE : La base de données n\'existe pas. Exécutez: createdb -U postgres yellomind_tms');
    }
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
})();
