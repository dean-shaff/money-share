"use strict";

const bcrypt = require('bcrypt')
const uuid = require("uuid")
const Moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    date: {
      type: DataTypes.DATE,
      get: function() {
        return Moment(this.getDataValue("date")).format("MMMM Do, YYYY");
      }
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  });

  User.beforeCreate(async function(user, options) {
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(user.password, salt);
  })

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  }

  return User;
};
