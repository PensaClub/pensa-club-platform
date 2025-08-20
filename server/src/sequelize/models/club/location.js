'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubLocation extends Model {
        static associate(models) {
            ClubLocation.belongsTo(models.Club, {
                foreignKey: 'clubId',
                as: 'club',
                onDelete: 'CASCADE',
            });
        }

        toJSON() {
            const values = { ...this.get() };
            if (values.id) {
                values.id = values.id.toString();
            }
            return values;
        }
    }

    ClubLocation.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            clubId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'club_id',
                references: {
                    model: 'clubs',
                    key: 'id',
                },
                unique: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            municipality: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            region: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            postalCode: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'postal_code',
            },
            coordinates: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'GPS coordinates: {lat: number, lng: number}',
            },
            venue: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Venue info: {type, size, capacity, facilities, accessibility}',
            },
        },
        {
            sequelize,
            modelName: 'ClubLocation',
            tableName: 'club_locations',
            timestamps: true,
            underscored: true,
        }
    );

    return ClubLocation;
};
