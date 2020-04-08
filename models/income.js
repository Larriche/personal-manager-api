'use strict';
module.exports = (sequelize, DataTypes) => {
  const Income = sequelize.define('Income', {
    name: DataTypes.STRING
  }, {
    tableName: 'incomes'
  });

  Income.associate = function(models) {
    Income.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'user'
    });

    Income.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      onDelete: 'CASCADE',
      as: 'wallet'
    });

    Income.belongsTo(models.IncomeSource, {
      foreignKey: 'incomeSourceId',
      onDelete: 'CASCADE',
      as: 'income_source'
    });
  };

  return Income;
};