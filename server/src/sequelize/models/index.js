"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

const getSequelizeConfig = (env, config) => {
  const { database, username, password, database_uri } = config;
  const commonConfig = {
    logging: false,
    dialect: 'postgres'
  };
  
  if (env === 'development') {
    return {
      ...commonConfig,
      database,
      username,
      password,
      host: config.host,
      dialect: 'postgres',
    };
  } else {
    return (
      database_uri, {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      }
    );
  }
};

const sequelizeConfig = getSequelizeConfig(process.env.NODE_ENV, config);
const sequelize = new Sequelize(sequelizeConfig);
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js" && file.indexOf(".test.js") === -1;
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
