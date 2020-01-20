'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    tableName: 'users'
  });

  User.associate = function(models) {
    User.hasMany(models.SpendingCategory, {
      foreignKey: 'userId',
      as: 'spending_categories'
    });
  };

  return User;
};