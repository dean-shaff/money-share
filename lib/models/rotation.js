"use strict";

const uuid = require("uuid")
const Moment = require("moment");


module.exports = (sequelize, DataTypes) => {
  const Rotation = sequelize.define("Rotation", {
    name: DataTypes.STRING,
    dateStarted: {
      type: DataTypes.DATE,
      get: function() {
        return Moment(this.getDataValue("dateStarted")).format("MMMM Do, YYYY");
      }
    },
    cycleDuration: DataTypes.INTEGER,
    cycleAmount: DataTypes.FLOAT,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  })

  return Rotation
};
