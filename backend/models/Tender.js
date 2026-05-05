const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tender = sequelize.define('Tender', {
    tender_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    client: { type: DataTypes.STRING(255), allowNull: false },
    statut: { type: DataTypes.STRING(20), defaultValue: 'detecte' },
    date_limite: { type: DataTypes.DATEONLY },
    budget: { type: DataTypes.STRING(100) },
    responsable: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.TEXT },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'tenders', timestamps: false });

  return Tender;
};
