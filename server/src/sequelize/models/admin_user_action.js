'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class admin_user_action extends Model {
        static associate(models) {
            admin_user_action.belongsTo(models.user_account, {
                foreignKey: 'adminId',
                targetKey: 'id',
                as: 'admin',
            });
            admin_user_action.belongsTo(models.user_account, {
                foreignKey: 'targetUserId',
                targetKey: 'id',
                as: 'targetUser',
            });
        }
    }

    admin_user_action.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            actionType: {
                type: DataTypes.ENUM(
                    'lookup_user',
                    'invite_user',
                    'send_reset_link',
                    'reset_completed',
                    'reset_failed'
                ),
                allowNull: false,
                field: 'action_type',
            },
            adminId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'admin_id',
            },
            targetUserId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'target_user_id',
            },
            targetEmail: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'target_email',
            },
            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true,
                field: 'ip_address',
            },
            userAgent: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'user_agent',
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            success: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'admin_user_action',
            tableName: 'admin_user_actions',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false, // immutable — only created
        }
    );

    return admin_user_action;
};
