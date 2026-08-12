const { migrate, undo, status, getPendingMigrations, sequelize } = require('./runnerCore');
const { create } = require('./runnerCreate');

// CLI handler
const run = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    await sequelize.authenticate();
    
    switch (command) {
      case 'migrate':
        await migrate();
        break;
      case 'undo':
        await undo();
        break;
      case 'status':
        await status();
        break;
      case 'create':
        const nameArg = args.find(a => a.startsWith('--name='));
        const name = nameArg ? nameArg.split('=')[1] : null;
        await create(name);
        break;
      default:
        console.log('Usage: node runner.js [migrate|undo|status|create --name=migration_name]');
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

module.exports = { migrate, undo, status, create, getPendingMigrations, sequelize };

// Run if called directly
if (require.main === module) {
  run();
}
