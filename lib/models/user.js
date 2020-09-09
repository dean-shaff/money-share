"use strict";

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
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  });

  return User;
};
