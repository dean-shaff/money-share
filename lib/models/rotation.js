"use strict";

const uuid = require("uuid")
const Moment = require("moment");

const User = require('./user.js')

module.exports = (sequelize, DataTypes) => {
  const Rotation = sequelize.define("Rotation", {
    name: DataTypes.STRING,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  });

  return Rotation;
};
