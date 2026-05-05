/**
 * ============================================================
 * YELLOMIND TMS — Full Database Setup Script
 * ============================================================
 * Runs: sync all tables + seed roles + seed permissions + seed admin user
 * Usage: node setup-db.js
 * ============================================================
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// ---- Model definitions (inline to avoid import issues) ----
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

// Junction table role_permissions
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
  { role_id: 3, libelle: 'Commercial' },
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
];

// Admin gets ALL permissions
const ADMIN_PERMISSIONS = PERMISSIONS.map(p => p.code);
// Manager gets read + create
const MANAGER_PERMISSIONS = ['appel_offre:read', 'appel_offre:create', 'appel_offre:update', 'client:read', 'client:create'];
// Commercial gets read only
const COMMERCIAL_PERMISSIONS = ['appel_offre:read', 'client:read'];

const ADMIN_USER = {
  nom: 'Admin',
  prenom: 'Yellomind',
  email: 'admin@yellomind.com',
  password: 'Admin2025',
  role_id: 1,
};

const log = (msg, ok = true) => console.log(`${ok ? '✅' : '❌'} ${msg}`);
const sep = () => console.log('─'.repeat(50));

// ---- Main ----
(async () => {
  sep();
  console.log('  YELLOMIND TMS — Database Setup');
  sep();

  try {
    // 1. Test connection
    await sequelize.authenticate();
    log('Connexion PostgreSQL réussie');

    // 2. Sync all tables (create if not exist)
    await sequelize.sync({ force: false, alter: false });

    // Create tables manually for junction table safety
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
    log('Tables créées / vérifiées');

    // 3. Seed Roles
    for (const role of ROLES) {
      await sequelize.query(
        `INSERT INTO roles (role_id, libelle) VALUES (:role_id, :libelle)
         ON CONFLICT (role_id) DO NOTHING`,
        { replacements: role }
      );
    }
    log('Rôles insérés (Admin, Manager, Commercial)');

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
      ...COMMERCIAL_PERMISSIONS.map(code => ({ role_id: 3, permission_id: permMap[code] })),
    ].filter(r => r.permission_id);

    for (const rp of rolePermAssignments) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)
         ON CONFLICT DO NOTHING`,
        { replacements: rp }
      );
    }
    log('Permissions assignées aux rôles');

    // 6. Create admin user
    const hash = await bcrypt.hash(ADMIN_USER.password, 12);
    await sequelize.query(
      `DELETE FROM utilisateurs WHERE email = :email`,
      { replacements: { email: ADMIN_USER.email } }
    );
    await sequelize.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role_id, actif)
       VALUES (:nom, :prenom, :email, :hash, :role_id, true)`,
      { replacements: { ...ADMIN_USER, hash } }
    );
    log('Utilisateur admin créé');

    // 7. Seed demo clients
    const demoClients = [
      { raison_sociale: 'Ministère du Travail', secteur: 'Secteur public', pays: 'Algérie', email: 'contact@mtravail.dz' },
      { raison_sociale: 'Banque Nationale d\'Algérie', secteur: 'Banque & Finance', pays: 'Algérie', email: 'dsi@bna.dz' },
      { raison_sociale: 'Groupe Cevital', secteur: 'Industrie', pays: 'Algérie', email: 'achats@cevital.dz' },
    ];
    for (const c of demoClients) {
      await sequelize.query(
        `INSERT INTO clients (raison_sociale, secteur, pays, email)
         VALUES (:raison_sociale, :secteur, :pays, :email)
         ON CONFLICT DO NOTHING`,
        { replacements: c }
      );
    }
    log('3 clients de démonstration insérés');

    sep();
    console.log('');
    console.log('  🎉  BASE DE DONNÉES PRÊTE !');
    console.log('');
    console.log('  Connectez-vous avec :');
    console.log('  📧  Email    : admin@yellomind.com');
    console.log('  🔑  Password : Admin2025');
    console.log('');
    sep();

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('❌ ERREUR COMPLÈTE :');
    console.dir(err, { depth: null });
    console.error('   Message :', err.message || '(empty)');
    console.error('');

    const msg = (err.message || '') + (err.original?.message || '') + (err.code || '');

    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || !err.message) {
      console.error('──────────────────────────────────────────────');
      console.error('  CAUSE : PostgreSQL ne tourne pas ou n\'est pas installé.');
      console.error('  FIX   : Installez PostgreSQL d\'abord (voir instructions)');
      console.error('──────────────────────────────────────────────');
    } else if (msg.includes('password') || msg.includes('authentication')) {
      console.error('  CAUSE : Mot de passe incorrect.');
      console.error('  FIX   : Vérifiez DATABASE_URL dans .env (password = lina)');
    } else if (msg.includes('does not exist')) {
      console.error('  CAUSE : La base de données yellomind_tms n\'existe pas encore.');
      console.error('  FIX   : createdb -U postgres yellomind_tms');
    }

    await sequelize.close().catch(() => {});
    process.exit(1);
  }
})();
