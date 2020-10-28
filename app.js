const { init, start } = require("./lib/server.js")

const main = async function () {
  const server = await init()
  await start(server)
}

process.on('unhandledRejection', (err) => {
  console.log("Encountered an error:")
  console.log(err)
  process.exit(1)
})

main()
