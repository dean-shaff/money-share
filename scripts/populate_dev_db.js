const fs = require('fs')
const path = require('path')

const { DateTime } = require('luxon')

const { init } = require("./../lib/server.js")
const controllers = require("./../lib/controllers")
const settings = require('./../settings.js')

const dbFilePath = path.join(__dirname, "..", "db", "db.sqlite")

const now = DateTime.local()
// let dateStarted = now.minus({ days: 7 })


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

let rotationParams = [
  {
    name: "Incomplete Rotation",
    cycleAmount: 200,
    cycleDuration: 28,
    nonPayingCycles: 1,
    membersPerCycle: 1,
    started: false
  },
  {
    name: "My Rotation",
    cycleAmount: 100,
    cycleDuration: 14,
    nonPayingCycles: 2,
    membersPerCycle: 1,
    started: true,
    dateStarted: now.minus({days: 7})
  },
  {
    name: "My Second Rotation",
    cycleAmount: 200,
    cycleDuration: 1,
    cycleDurationUnit: 'months',
    nonPayingCycles: 2,
    membersPerCycle: 2,
    started: true,
    dateStarted: now.minus({days: 54}),
  },

]


const main = async () => {
  if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath)
  }
  let server = await init();


  users = await Promise.all(users.map(user => {
    return controllers.user.create({ payload: user })
  }))

  const basePayload = {
    managerId: users[0].id,
    memberIds: users.map(user => user.id)
  }

  for (let idx=0; idx<rotationParams.length; idx++) {
    let params = rotationParams[idx]
    let rotation = await controllers.rotation.create({
      payload: Object.assign(basePayload, params)
    })

    if (! params.started) {
      continue
    }
    await Promise.all(users.map((user, idx) => {
      if (idx % 2 == 0) {
        const userId = user.id
        const randomDay = Math.floor(Math.random()*(params.cycleDuration-1)) + 1
        return controllers.cycleNote.create({
          params: { 'userId': userId },
          payload: {
            amountPaid: params.cycleAmount,
            datePaid: params.dateStarted.plus({ days: randomDay }),
            rotationId: rotation.id
          }
        })
      }
    }))
  }


  await server.stop();
}


main()
