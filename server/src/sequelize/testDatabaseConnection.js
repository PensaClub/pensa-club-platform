const { sequelize } = require('./models');
const { exec } = require('child_process');

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  try {
    // if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
    // }
  } catch (error) {
    console.log('Models could not be synced.', error);
  }


  if (process.env.NODE_ENV === 'development') {
    const seedsExist = await checkForSeedData();
    if (!seedsExist) {
      console.log('Seeding data as it does not exist.');
      seedDatabase();
    } else {
      console.log('Seed data already present. No need to seed.');
    }
  }
}

async function checkForSeedData() {
  const User = require('./models').user_account;
  try {
    const userExists = await User.findOne({ where: { email: 'test@test.com' } });
    return userExists !== null;
  } catch (error) {
    console.error('Error checking seed data:', error);
    return false;
  }
}
function seedDatabase() {
  exec('npx sequelize-cli db:seed:all', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error seeding the database: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error during seeding: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

module.exports = testDatabaseConnection;
