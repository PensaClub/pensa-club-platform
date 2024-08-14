const { sequelize } = require('./models');
const { executeMigrations, seedIfNeeded } = require('./sequelizeUtils');

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  await executeMigrations();

  try {
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.log('Models could not be synced.', error);
  }

  await seedIfNeeded();
}

module.exports = testDatabaseConnection;
