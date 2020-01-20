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
    // User has many spending categories
    User.hasMany(models.SpendingCategory, {
      foreignKey: 'userId',
      as: 'spending_categories'
    });

    // User has many income sources
    User.hasMany(models.IncomeSource, {
      foreignKey: 'userId',
      as: 'income_sources'
    });
  };

  return User;
};