const axios = require('axios')

const settings = require('./../../settings.js')

const site = settings[process.env.NODE_ENV].baseURL

let user = {
  name: 'Dean Shaff',
  username: 'deanshaff',
  password: 'deanshaff'
}

module.exports = {
  'user': user,
  'createTestDb': async function () {
    const token = await axios.post(`${site}/register`, user).then(resp => resp.data)
    axios.defaults.headers.common['Authorization'] = token.id_token
  }
}
