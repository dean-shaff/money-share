require('expect-puppeteer')

const settings = require('./../../settings.js')

const site = settings[process.env.NODE_ENV].baseURL

const username = 'deanshaff'
const password = 'deanshaffpassword'


describe('Money Share', () => {

  beforeAll(async () => {
    await page.goto(site)
  })

  it('should display "Money Share App" text on page', async () => {
    await expect(page).toMatch("Money Share App")
  })
})
