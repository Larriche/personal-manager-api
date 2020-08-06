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

      color: {
        allowNull: false,
        type: Sequelize.STRING
      },

      balance: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DECIMAL
      },

      user_id: {
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

      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Wallets');
  }
};