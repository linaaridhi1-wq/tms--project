const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KnowledgeItem = sequelize.define('KnowledgeItem', {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    categorie: { type: DataTypes.STRING(100), allowNull: false },
    secteur: { type: DataTypes.STRING(100) },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    usages: { type: DataTypes.INTEGER, defaultValue: 0 },
    note: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'knowledge_items', timestamps: false });

  return KnowledgeItem;
};
