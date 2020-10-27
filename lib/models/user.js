"use strict";

const uuid = require("uuid")
const bcrypt = require('bcrypt')

const { createHash } = require("./../services/hash.js")
const settings = require('./../../settings.js')


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    date: DataTypes.DATE,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    autoCreated: DataTypes.BOOLEAN,
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  });


  User.beforeCreate(async function(user, options) {
    if (user.password !== undefined) {
      user.password = await createHash(user.password)
    }
  })

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  }

  User.publicAttributes = ['id', 'name', 'username', 'email', 'phone', 'autoCreated', 'admin']

  return User;
};
