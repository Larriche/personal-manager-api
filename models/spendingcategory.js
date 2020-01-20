'use strict';
module.exports = (sequelize, DataTypes) => {
  const SpendingCategory = sequelize.define('SpendingCategory', {
    name: DataTypes.STRING
  }, {
    tableName: 'spending_categories'
  });

  SpendingCategory.associate = function(models) {
    SpendingCategory.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  };

  return SpendingCategory;
};