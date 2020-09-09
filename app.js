const {init, start} = require("./lib/server.js")

const main = async function () {
  const server = await init()
  await start(server)
}

main()
