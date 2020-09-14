const fs = require('fs')
const path = require('path')

const { init } = require("./../lib/server.js")
const controllers = require("./../lib/controllers")

const dbFilePath = path.join(__dirname, "..", "db", "db.sqlite")

let users = [
  {
    name: "Dean Shaff",
    username: "deanshaff",
    email: "dean.shaff@gmail.com",
    password: "deanshaffpassword"
  },
  {
    name: "Charles Shaff",
    username: "charlesshaff",
    email: "charles.shaff@gmail.com",
    password: "charlesshaffpassword"
  }
]

for (let idx=0; idx<10; idx++) {
  users.push({
    name: `name_${idx}`,
    username: `username_${idx}`,
    email: `${idx}@address.com`,
    password: 'password'
  })
}



const main = async () => {
  if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath)
  }

  let server = await init();

  users = await Promise.all(users.map(user => {
    return controllers.user.create({ payload: user })
  }))

  controllers.rotation.create({
    payload: {
      name: "My Rotation",
      cycleAmount: 100,
      cycleDuration: 14,
      managerId: users[0].id,
      memberIds: users.map(user => user.id)
    }
  })

  await server.stop();
}


main()
