require('expect-puppeteer')
const axios = require('axios')

const settings = require('./../../settings.js')
const { createTestDb, user } = require('./createTestDb.js')

const site = settings[process.env.NODE_ENV].baseURL


describe('login page', () => {

  beforeAll(async () => {
    await createTestDb()
  })

  beforeEach(async () => {
    await page.goto(site)
    await page.evaluate(() => {
      let nl = document.querySelectorAll('a')
      Array.from(nl).filter(n => n.getAttribute('href') === '/login')[0].click()
    })
    await page.waitForNavigation()
  })

  it('should display "Login" on screen', async () => {
    await expect(page).toMatch("Login")
  })

  it('should be able to login existing user', async () => {
    await page.type('input[name=username]', user.username)
    await page.type('input[name=password]', user.password)
    await page.click('form button')
    await page.waitForNavigation()
  })

  it('should reject invalid login details', async () => {
    await page.type('input[name=username]', user.username)
    await page.type('input[name=password]', 'not the password')
    await page.click('form button')
    await page.waitForNavigation()
    let element = await page.$('has-text-danger')
    console.log(element)
    let value = await page.evaluate(el => el.textContent, element)

  })

})
