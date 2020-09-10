const fs = require('fs')
const path = require('path')

const { init } = require("./../lib/server.js")
const controllers = require("./../lib/controllers")

const dbFilePath = path.join(__dirname, "..", "db", "db.sqlite")

const users = [
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



const main = async () => {
  if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath)
  }

  let server = await init();

  for (let idx=0; idx<users.length; idx++) {
    let user = users[idx]
    await controllers.user.create({
      payload: user
    })
  }

  await server.stop();
}


main()
