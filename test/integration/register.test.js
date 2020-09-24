const expectPuppeteer = require('expect-puppeteer')
const { expect } = require('@hapi/code');

const settings = require('./../../settings.js')

const site = settings[process.env.NODE_ENV].baseURL


describe('Money Share', () => {
  beforeAll(async () => {
    await page.goto(site)
  })

  it('should be able to create a new user', async () => {
    // click on the Sign Up button on the home page
    await page.evaluate(() => {
      let nl = document.querySelectorAll('a')
      Array.from(nl).filter(n => n.getAttribute('href') === '/register')[0].click()
    })
    await page.waitForNavigation()
    expect(page.url()).to.equal(`${site}/register`)
    await page.type('input[name=username]', 'username')
    await page.type('input[name=email]', 'me@address')
    await page.type('input[name=password]', 'password')
    await page.click('form button')
    await page.waitForNavigation()
    // expect(page.url()).to.equal(`${site}/dashboard`)
  })
})
