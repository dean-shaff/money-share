const fs = require('fs')
const path = require('path')

const settings = require('./../settings.js')

const MoneyShareAppAPI = require('./MoneyShareAppAPI.js')

const me = {
  username: process.env.MSA_USERNAME,
  password: process.env.MSA_PASSWORD
}


const main = async () => {
  const api = await MoneyShareAppAPI.create(me.username, me.password)
  let user = await api.getUser({username: 'brandi-best'})
  let rotations = await api.getManagedRotations(user.id)
  console.log(rotations)

  let rotation = rotations.filter(rot => rot.name === 'levar Holston')[0]
  await api.updateRotation(rotation.id, {
    nonPayingCycles: 0,
    started: false,
    dateStarted: null
  })

  rotation = rotations.filter(rot => rot.name === 'Charles best')[0]
  await api.updateRotation(rotation.id, {
    started: false,
    dateStarted: null
  })


}

main()
