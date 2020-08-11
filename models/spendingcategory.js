'use strict';

module.exports = (sequelize, DataTypes) => {
    const SpendingCategory = sequelize.define('SpendingCategory', {
        name: DataTypes.STRING,
        color: DataTypes.STRING
    }, {
        tableName: 'spending_categories',
        underscored: true
    });

    SpendingCategory.associate = function(models) {
        SpendingCategory.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
            as: 'user'
        })
    };

    return SpendingCategory;
};