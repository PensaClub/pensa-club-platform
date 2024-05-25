'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_details.belongsTo(models.user_account, {
        foreignKey: 'user_accounts_id', // Foreign key in user_details table
        targetKey: 'id' // Primary key in user_accounts table
      })
    }
  }
  user_details.init({
    region: DataTypes.STRING,
    municipality: DataTypes.STRING,
    settlement: DataTypes.STRING,
    work: DataTypes.STRING,
    hobby: DataTypes.STRING,
    interest: DataTypes.STRING,
    district: DataTypes.STRING,
    block: DataTypes.STRING,
    street: DataTypes.STRING,
    street_number: DataTypes.STRING,
    location: DataTypes.JSONB,
    user_accounts_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_details',
  });
  return user_details;
};