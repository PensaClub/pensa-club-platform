'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(config);

/**
 * @param {string} dir
 * @param {string} namespace
 */

function loadModels(dir, namespace = '') {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadModels(fullPath, namespace + item + '/');
        } else if (item.indexOf('.') !== 0 && item !== basename && item.slice(-3) === '.js' && item.indexOf('.test.js') === -1) {
            const model = require(fullPath)(sequelize, Sequelize.DataTypes);
            const modelName = namespace ? `${namespace.replace(/\//g, '_')}${model.name}` : model.name;

            if (namespace) {
                db[modelName] = model;
            } else {
                db[model.name] = model;
            }
        }
    });
}

loadModels(__dirname);

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// ✅ ALIASES ЗА BACKCOMPAT - без да счупим съществуващи референции
db.Club = db.club_Club; // ✅ Alias: Club → club_Club
db.ClubDetails = db.club_ClubDetails;
db.ClubLocation = db.club_ClubLocation;
db.ClubMembership = db.club_ClubMembership;
db.ClubMember = db.club_ClubMember;
db.ClubActivity = db.club_ClubActivity;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;