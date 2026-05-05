const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Submission = sequelize.define('Submission', {
    submission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    appel: { type: DataTypes.STRING(255), allowNull: false },
    statut: { type: DataTypes.STRING(20), defaultValue: 'brouillon' },
    resultat: { type: DataTypes.STRING(20), defaultValue: 'pending' },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'submissions', timestamps: false });

  return Submission;
};
