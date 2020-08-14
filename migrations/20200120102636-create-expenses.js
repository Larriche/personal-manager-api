'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      spending_category_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: {
            tableName: 'spending_categories'
          },
          key: 'id',
          as: 'spendingCategory'
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

      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },

      time_made: {
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
    return queryInterface.dropTable('expenses');
  }
};