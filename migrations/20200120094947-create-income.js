'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('incomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      income_source_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: {
            tableName: 'income_sources'
          },
          key: 'id',
          as: 'incomeSource'
        }
      },

      wallet_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: {
            tableName: 'wallets'
          },
          key: 'id',
          as: 'wallet'
        }
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

      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL
      },

      time_received: {
        allowNull: false,
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Incomes');
  }
};