'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class initiativeBookmark extends Model {}
    initiativeBookmark.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'user_accounts', key: 'id' },
            },
            initiativeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'initiatives', key: 'id' },
            },
        },
        {
            sequelize,
            modelName: 'initiativeBookmark',
            tableName: 'initiativeBookmarks',
            timestamps: true,
        }
    );
    return initiativeBookmark;
};
