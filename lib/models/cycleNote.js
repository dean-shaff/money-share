"use strict";

const uuid = require("uuid")
const moment = require("moment");


module.exports = (sequelize, DataTypes) => {
  const CycleNote = sequelize.define("CycleNote", {
    datePaid: {
      type: DataTypes.DATE,
      // set: function(value) {
      //   console.log(`CycleNote.dataPaid.set`)
      //   this.setDataValue(moment(value))
      // },
      get: function() {
        return moment(this.getDataValue("dateStarted")).format("MMMM Do, YYYY");
      }
    },
    rotationId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
    amountPaid: DataTypes.FLOAT,
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: uuid.v4()
    },
  })

  return CycleNote
};
