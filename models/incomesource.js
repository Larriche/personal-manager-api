'use strict';

module.exports = (sequelize, DataTypes) => {
    const IncomeSource = sequelize.define('IncomeSource', {
        name: DataTypes.STRING,
        color: DataTypes.STRING
    }, {
        tableName: 'income_sources',
        underscored: true
    });

    IncomeSource.associate = function(models) {
        IncomeSource.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
            as: 'user'
        })
    };

    return IncomeSource;
};