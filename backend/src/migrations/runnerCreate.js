const fs = require('fs');
const path = require('path');
const { MIGRATIONS_DIR } = require('./runnerCore');

const create = async (name) => {
  if (!name) {
    console.error('❌ Please provide a migration name: npm run migration:create -- --name=migration_name');
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const filename = `${timestamp}_${name}.js`;
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  const template = `'use strict';

/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add migration logic here
    // Example:
    // await queryInterface.createTable('table_name', {
    //   id: {
    //     type: Sequelize.INTEGER,
    //     primaryKey: true,
    //     autoIncrement: true,
    //   },
    //   created_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    //   },
    //   updated_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    //   },
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // Add revert logic here
    // Example:
    // await queryInterface.dropTable('table_name');
  },
};
`;

  fs.writeFileSync(filepath, template);
  console.log(`\n✅ Created migration: ${filename}\n`);
};

module.exports = { create };
