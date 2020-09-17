"use strict";

const uuid = require("uuid")
// const DateTime = require('luxon')
const bcrypt = require('bcrypt')

const { createHash } = require("./../services/hash.js")
const settings = require('./../../settings.js')


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    date: {
      type: DataTypes.DATE,
      // get: function() {
      //   return this.getDataValue("date")
      // }
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    autoCreated: DataTypes.BOOLEAN,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  });


  User.beforeCreate(async function(user, options) {
    user.password = await createHash(user.password)
  })

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  }

  User.publicAttributes = ['id', 'name', 'username', 'email', 'autoCreated']

  return User;
};
