const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    client_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    raison_sociale: { type: DataTypes.STRING(255), allowNull: false },
    secteur: { type: DataTypes.STRING(100) },
    contact: { type: DataTypes.STRING(255) },
    email: { type: DataTypes.STRING(255) },
    telephone: { type: DataTypes.STRING(20) },
    pays: { type: DataTypes.STRING(100) },
    site_web: { type: DataTypes.STRING(255) },
    notes: { type: DataTypes.TEXT },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'clients', timestamps: false });

  // Note: l'association avec AppelOffre sera ajoutee au Module 3
  Client.associate = (models) => {
    if (models.AppelOffre) {
      Client.hasMany(models.AppelOffre, { foreignKey: 'client_id', as: 'appelsOffres' });
    }
  };

  return Client;
};