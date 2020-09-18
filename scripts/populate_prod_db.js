const axios = require('axios')
const qs = require('qs')

let users = [
  {
    name: "Dean Shaff",
    username: "deanshaff",
    email: "dean.shaff@gmail.com",
    password: "deanshaff"
  },
  {
    name: "Jose Velazquez de la Cruz Montero",
    username: "josedelacruz",
    email: 'josedelacrux@gmail.com',
    password: 'josedelacruxpassword'
  }
]

const baseURL = 'https://money-share-app.herokuapp.com'

const main = async () => {
  const token = await axios.post(`${baseURL}/login`, {
    username: users[0].username,
    password: users[0].password
  })
  axios.defaults.headers.common['Authorization'] = token.data.id_token
  const query = qs.stringify({ usernames: ['deanshaff'] })
  const user = (await axios.get(`${baseURL}/api/user/?${query}`)).data[0]

  let newUser
  try {
    newUser = await axios.post(`${baseURL}/api/user`, users[0]).then(resp => resp.data)
  } catch (err) { }

}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


main()
