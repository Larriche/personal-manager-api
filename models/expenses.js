'use strict';
module.exports = (sequelize, DataTypes) => {
  const expenses = sequelize.define('Expense', {
    amount: DataTypes.DECIMAL
  }, {tableName: 'expenses'});

  expenses.associate = function(models) {
    Expense.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'user'
    });

    Expense.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      onDelete: 'CASCADE',
      as: 'wallet'
    });

    Expense.belongsTo(models.SpendingCategory, {
      foreignKey: 'spendingCategoryId',
      onDelete: 'CASCADE',
      as: 'spending_category'
    });
  };

  return expenses;
};