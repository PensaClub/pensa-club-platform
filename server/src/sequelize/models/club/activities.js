'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubActivity extends Model {
        static associate(models) {
            ClubActivity.belongsTo(models.club_Club, {
                foreignKey: 'clubId',
                as: 'activityClub',
                onDelete: 'CASCADE',
            });
        }

        toJSON() {
            const values = { ...this.get() };
            if (values.id) {
                values.id = values.id.toString();
            }
            if (values.clubId) {
                values.clubId = values.clubId.toString();
            }
            return values;
        }
    }

    ClubActivity.init(
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
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Activity type: regular, event, trip, course - validated by app schema',
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            data: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Activity-specific data based on type - validated by app schema',
            },
            schedule: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Schedule info: day, time, frequency, etc.',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_active',
            },
            featured: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Display order for activities',
            },
        },
        {
            sequelize,
            modelName: 'ClubActivity',
            tableName: 'club_activities',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['club_id', 'type'],
                    name: 'club_activities_club_type_idx',
                },
                {
                    fields: ['club_id', 'is_active'],
                    name: 'club_activities_club_active_idx',
                },
                {
                    fields: ['club_id', 'order'],
                    name: 'club_activities_club_order_idx',
                },
            ],
        }
    );

    return ClubActivity;
};
