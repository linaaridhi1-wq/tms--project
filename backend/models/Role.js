const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    libelle: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, { tableName: 'roles', timestamps: false });

  Role.associate = (models) => {
    Role.hasMany(models.Utilisateur, { foreignKey: 'role_id' });
    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
      timestamps: false,
    });
  };
  return Role;
};