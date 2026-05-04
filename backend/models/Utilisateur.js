const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(100), allowNull: false },
    prenom: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'utilisateurs', timestamps: false,
    hooks: {
      beforeCreate: async (u) => { u.mot_de_passe = await bcrypt.hash(u.mot_de_passe, 12); },
      beforeUpdate: async (u) => { if (u.changed('mot_de_passe')) u.mot_de_passe = await bcrypt.hash(u.mot_de_passe, 12); },
    },
  });
  Utilisateur.prototype.verifierMotDePasse = async function(mdp) { return bcrypt.compare(mdp, this.mot_de_passe); };
  Utilisateur.prototype.toJSON = function() { const v = { ...this.get() }; delete v.mot_de_passe; return v; };
  Utilisateur.associate = (models) => {
    Utilisateur.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    Utilisateur.hasMany(models.Session, { foreignKey: 'user_id', as: 'sessions' });
  };
  return Utilisateur;
};