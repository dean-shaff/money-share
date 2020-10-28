const fs = require('fs')

const { DateTime } = require('luxon')

require('./../settings.js')
const MoneyShareAppAPI = require('./MoneyShareAppAPI.js')

const me = {
  username: process.env.ES_USERNAME,
  password: process.env.ES_PASSWORD
}


const main = async () => {
  const api = await MoneyShareAppAPI.create(me.username, me.password)
  const users = await api.getUsers()
  const rotations = await api.getRotations()

  const data = { users, rotations }
  const now = DateTime.local()

  fs.writeFileSync(`backup.${now}.json`, JSON.stringify(data))

}

main()
