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

db.sequelize = sequelize

fs.readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })


db.User.hasMany(db.CycleNote)
db.CycleNote.belongsTo(db.User)

db.User.hasMany(db.Rotation, {as: 'managedRotations'})
db.Rotation.belongsTo(db.User, {as: 'manager'})

const MemberRotation = sequelize.define('MemberRotation', {
  rotationIndex: Sequelize.DataTypes.INTEGER
})

db.Rotation.belongsToMany(db.User, {as: 'members', through: MemberRotation})
db.User.belongsToMany(db.Rotation, {as: 'memberRotations', through: MemberRotation})


module.exports = db
