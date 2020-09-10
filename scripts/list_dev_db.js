const fs = require('fs')
const path = require('path')

const { init } = require("./../lib/server.js")
const controllers = require("./../lib/controllers")


const main = async () => {

  let server = await init();

  const { users } = await controllers.user.list()

  users.forEach((user, idx) => {
    console.log(`User ${idx}`)
    console.log(` username: ${user.dataValues.username}`)
    if ('name' in user.dataValues) {
      console.log(` name: ${user.dataValues.name}`)
    }
    if ('email' in user.dataValues) {
      console.log(` email: ${user.dataValues.email}`)
    }

  })

  await server.stop();
}


main()
