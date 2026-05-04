const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    permission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
  }, { tableName: 'permissions', timestamps: false });

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      timestamps: false,
    });
  };
  return Permission;
};