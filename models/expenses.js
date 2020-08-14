'use strict';
module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    amount: DataTypes.DECIMAL,
    spendingCategoryId: DataTypes.INTEGER,
    walletId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    timeMade: DataTypes.DATE
  }, {
    tableName: 'expenses',
    underscored: true
  });

  Expense.associate = function(models) {
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

  return Expense;
};