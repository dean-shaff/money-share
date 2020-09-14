// jest-puppeteer.config.js
module.exports = {
  server: {
    command: 'node app.js',
    port: 8000,
  },
  launch: {
    headless: true
  },
}
