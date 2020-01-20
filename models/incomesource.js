'use strict';
module.exports = (sequelize, DataTypes) => {
  const IncomeSource = sequelize.define('IncomeSource', {
    name: DataTypes.STRING
  }, {
    tableName: 'income_sources'
  });

  IncomeSource.associate = function(models) {
    IncomeSource.belongsTo(models.User, {
       foreignKey: 'userId',
       onDelete: 'CASCADE'
     })
  };

  return IncomeSource;
};