const axios = require('axios')
const qs = require('qs')

// const baseURL = 'https://money-share-app.herokuapp.com'
const baseURL = 'https://eternalsharing.com'


class MoneyShareAppAPI {

  constructor () { }

  async init (username, password) {
    const token = await axios.post(`${baseURL}/login`, {
      username, password
    })
    console.log(`MoneyShareAppAPI.constructor: token=${token.data.id_token}`)
    axios.defaults.headers.common['Authorization'] = token.data.id_token
    return this
  }

  get(endpoint, options) {
    return axios.get(`${baseURL}${endpoint}`, options)
  }

  post(endpoint, options) {
    return axios.post(`${baseURL}${endpoint}`, options)
  }

  put(endpoint, options) {
    return axios.put(`${baseURL}${endpoint}`, options)
  }

  delete(endpoint) {
    return axios.delete(`${baseURL}${endpoint}`)
  }


  async getUser (options) {
    const query = qs.stringify({usernames: [options.username]})
    let user = (await this.get(`/api/user/?${query}`)).data
    if (user.length === 0) {
      return null
    } else {
      return user[0]
    }
  }

  async getUsers (options) {
    return (await this.get(`/api/user`)).data
  }

  async createUser (options) {
    const _createUser = async (options) => {
      return (await this.post(`/api/user`, options)).data
    }

    const query = qs.stringify({usernames: [options.username]})
    let user = (await axios.get(`${baseURL}/api/user/?${query}`)).data
    if (user.length === 0) {
      user = await _createUser(options)
      return user
    } else {
      return user[0]
    }
  }

  async getManagedRotations (userId) {
    return (await this.get(`/api/user/${userId}/managedRotations`)).data
  }

  async getRotation (rotationId) {
    return (await this.get(`/api/rotation/${rotationId}`)).data
  }

  async updateRotation (rotationId, options) {
    return (await this.put(`/api/rotation/${rotationId}`, options)).data
  }


  static async create (username, password) {
    const api = new MoneyShareAppAPI()
    await api.init(username, password)
    return api
  }


}

module.exports = MoneyShareAppAPI
