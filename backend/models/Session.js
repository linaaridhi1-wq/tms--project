const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Session = sequelize.define('Session', {
    session_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'sessions', timestamps: false });
  Session.associate = (models) => { Session.belongsTo(models.Utilisateur, { foreignKey: 'user_id' }); };
  return Session;
};