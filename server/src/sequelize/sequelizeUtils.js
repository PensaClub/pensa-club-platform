const { exec } = require('child_process');
const { user_account } = require('./models/index');

// Seed Logic -------------------------------------------------------------------

async function seedIfNeeded() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const email = isDevelopment ? undefined : process.env.admin_email;
  const seedFunction = isDevelopment ? seedDatabase : seedAdminAccount;

  const seedsExist = await checkForSeedData(email);
  if (!seedsExist) {
    console.log(`Seeding ${isDevelopment ? 'data' : 'admin account'} as it does not exist.`);
    await seedFunction();
  } else {
    console.log(`${isDevelopment ? 'Seed data' : 'Admin account'} already present. No need to seed.`);
  }
}

async function checkForSeedData(email = 'test@test.com') {
  try {
    const userExists = await user_account.findOne({ where: { email } });
    return userExists !== null;
  } catch (error) {
    console.error('Error checking seed data:', error);
    return false;
  }
}

async function seedDatabase() {
  await runSeedingCommand('npx sequelize-cli db:seed:all', 'database');
}

async function seedAdminAccount() {
  await runSeedingCommand('npx sequelize-cli db:seed --seed 20240728095402-admin.js', 'admin account');
}

async function runSeedingCommand(command, description) {
  try {
    const result = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`Error seeding the ${description}: ${error.message}`);
        } else if (stderr) {
          reject(`Error during ${description} seeding: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
    console.log(`${description.charAt(0).toUpperCase() + description.slice(1)} seeded successfully.`);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// Migration Logic -------------------------------------------------------------------

async function executeMigrations() {
  try {
    const pendingMigrations = await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:migrate:status', (error, stdout, stderr) => {
        if (error) {
          reject(`Error checking migration status: ${error.message}`);
        } else if (stderr) {
          reject(`Error during migration status check: ${stderr}`);
        } else {
          resolve(stdout.includes('down'));
        }
      });
    });

    if (pendingMigrations) {
      const result = await new Promise((resolve, reject) => {
        exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
          if (error) {
            reject(`Error running migrations: ${error.message}`);
          } else if (stderr) {
            reject(`Error during migrations: ${stderr}`);
          } else {
            resolve(stdout);
          }
        });
      });
      console.log('Migrations executed successfully.');
      console.log(result);
    } else {
      console.log('No pending migrations found.');
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  executeMigrations,
  seedIfNeeded,
};
