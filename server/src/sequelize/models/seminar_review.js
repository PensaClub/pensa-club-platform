'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class seminar_review extends Model {
        static associate(models) {
            seminar_review.belongsTo(models.seminar, { foreignKey: 'seminar_id', as: 'seminar' });
            seminar_review.belongsTo(models.student, { foreignKey: 'student_id', as: 'student' });
        }
    }

    seminar_review.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        seminarId: { type: DataTypes.INTEGER, allowNull: false, field: 'seminar_id' },
        studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
        rating: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' }
    }, {
        sequelize,
        modelName: 'seminar_review',
        tableName: 'seminar_reviews',
        underscored: true,
        timestamps: true
    });

    return seminar_review;
};
