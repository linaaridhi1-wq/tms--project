require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion BDD OK');

    const password = 'Admin2025';
    const hash = await bcrypt.hash(password, 12);

    // Supprime l'ancien admin s'il existe
    await sequelize.query("DELETE FROM utilisateurs WHERE email = 'admin@yellomind.com'");

    // Cree un nouvel admin avec le bon hash
    await sequelize.query(`
      INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role_id, actif)
      VALUES ('Admin', 'Yellomind', 'admin@yellomind.com', :hash, 1, true)
    `, { replacements: { hash } });

    console.log('');
    console.log('Admin cree avec succes !');
    console.log('Email : admin@yellomind.com');
    console.log('Mot de passe : ' + password);

    await sequelize.close();
  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  }
})();