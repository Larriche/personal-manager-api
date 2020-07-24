'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        tableName: 'users',
        underscored: true,

        hooks: {
            beforeCreate: (user) => {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(user.password, salt);
            }
        }
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

        // User has many wallets
        User.hasMany(models.Wallet, {
            foreignKey: 'userId',
            as: 'wallets'
        });
    };

    User.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    return User;
};