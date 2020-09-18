const axios = require('axios')

let users = [
  {
    name: "Dean Shaff",
    username: "deanshaff",
    email: "dean.shaff@gmail.com",
    password: "deanshaffpassword"
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
  let result = await Promise.all(users.map(user => {
    return axios.post(`${baseURL}/api/user`, user)
  }))
  console.log(result)
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


main()
