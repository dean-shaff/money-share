const fs = require('fs')
const path = require('path')

const { DateTime } = require('luxon')

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
    name: "Jose Velazquez de la Cruz Montero",
    username: "josedelacruz",
    email: 'josedelacrux@gmail.com',
    password: 'josedelacruxpassword'
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

  let now = DateTime.local()

  // let's say the rotation started a week ago
  let dateStarted = now.minus({ days: 7 })

  users = await Promise.all(users.map(user => {
    return controllers.user.create({ payload: user })
  }))


  let rotation = await controllers.rotation.create({
    payload: {
      name: "My Rotation",
      cycleAmount: 100,
      cycleDuration: 14,
      nonPayingCycles: 2,
      membersPerCycle: 1,
      started: true,
      'dateStarted': dateStarted,
      managerId: users[0].id,
      memberIds: users.map(user => user.id)
    }
  })

  await Promise.all(users.map((user, idx) => {
    if (idx % 2 == 0) {
      const userId = user.id
      const randomDay = Math.floor(Math.random()*6) + 1
      return controllers.cycleNote.create({
        params: { 'userId': userId },
        payload: {
          amountPaid: 100.0,
          datePaid: dateStarted.plus({ days: randomDay }),
          rotationId: rotation.id
        }
      })
    }
  }))

  await server.stop();
}


main()
