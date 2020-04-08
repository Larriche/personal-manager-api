'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('wallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        allowNull: false,
        type: Sequelize.STRING
      },

      balance: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DECIMAL
      },

      userId: {
         allowNull: false,
         type: Sequelize.INTEGER,
         onDelete: 'CASCADE',
         references: {
           model: {
             tableName: 'users'
           },
           key: 'id',
           as: 'user'
         }
       },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Wallets');
  }
};