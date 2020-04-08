'use strict';
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    name: DataTypes.STRING
  }, {
    tableName: 'wallets'
  });

  Wallet.associate = function(models) {
    Wallet.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  };

  return Wallet;
};