const { sequelize } = require("./models");

async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    try {
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ force: false });
            console.log('All models were synchronized successfully.');
        }
    }
    catch (error) {
        console.log('Models could not be synced.', error);
    }
}

module.exports = testDatabaseConnection;