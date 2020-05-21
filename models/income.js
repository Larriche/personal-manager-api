'use strict';

module.exports = (sequelize, DataTypes) => {
    const Income = sequelize.define('Income', {
        incomeSourceId: DataTypes.INTEGER,
        walletId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
        amount: DataTypes.DECIMAL,
        timeReceived: DataTypes.DATE
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