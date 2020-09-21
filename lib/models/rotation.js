"use strict";

const uuid = require("uuid")
// const Moment = require("moment");


module.exports = (sequelize, DataTypes) => {
  const Rotation = sequelize.define("Rotation", {
    name: DataTypes.STRING,
    dateStarted: {
      type: DataTypes.DATE
      // get: function() {
      //   return Moment(this.getDataValue("dateStarted")).format("MMMM Do, YYYY");
      // }
    },
    membersPerCycle: DataTypes.INTEGER,
    nonPayingCycles: DataTypes.INTEGER,
    started: DataTypes.BOOLEAN,
    cycleDuration: DataTypes.INTEGER,
    cycleDurationUnit: {
      type: DataTypes.STRING,
      defaultValue: 'days'
    },
    cycleAmount: DataTypes.FLOAT,
    cycleAmountCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'usd'
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  })

  return Rotation
};
