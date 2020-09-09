"use strict"

const fs = require("fs")
const path = require("path")
const Sequelize = require("sequelize")
const settings = require("../../settings.js")
const dbSettings = settings[settings.env].db


const sequelizeFactory = function (dbSettings) {
  let sequelize
  if (dbSettings.url) {
    sequelize = new Sequelize(dbSettings.url)
  } else {
    sequelize = new Sequelize(dbSettings)
  }
  return sequelize
}

const sequelize = sequelizeFactory(dbSettings)

const db = {}

fs.readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

db.sequelize = sequelize

module.exports = db
