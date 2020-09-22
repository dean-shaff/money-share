const fs = require('fs')
const path = require('path')

const axios = require('axios')
const qs = require('qs')
const slug = require('slug')

const me = {
  username: 'deanshaff',
  password: 'JFDgyjMcYDjx6r7MF7Ps'
}



const fileName = 'names.txt'
const filePath = path.join(__dirname, fileName)

const baseURL = 'https://money-share-app.herokuapp.com'

let users = [
  {
    name: "Brandi Best",
    username: "brandi-best",
    password: "brandi-best",
    autoCreated: true
  }
]


const parseNames = (contents) => {
  return contents.split(', ').map(val => val.replace('\n', ''))
}

const createUser = async (options) => {
  return (await axios.post(`${baseURL}/api/user`, options)).data
}

const createRotation = async (options) => {
  return (await axios.post(`${baseURL}/api/rotation`, options)).data
}

const getOrCreateUser = async (options) => {
  const query = qs.stringify({usernames: [options.username]})
  let user = (await axios.get(`${baseURL}/api/user/?${query}`)).data
  if (user.length === 0) {
    user = await createUser(options)
    return user
  } else {
    return user[0]
  }
}


const main = async () => {

  const contents = fs.readFileSync(filePath, 'utf8')
  const parsed = parseNames(contents)

  for (let idx=0; idx<parsed.length; idx++) {
    users.push({
      name: parsed[idx],
      username: slug(parsed[idx]),
      autoCreated: true
    })
  }

  const token = await axios.post(`${baseURL}/login`, {
    username: me.username,
    password: me.password
  })
  axios.defaults.headers.common['Authorization'] = token.data.id_token

  const members = await Promise.all(users.map(info => getOrCreateUser(info)))

  const rotation = {
    managerId: members[0].id,
    memberIds: members.map(mem => mem.id),
    name: "Brandi's Rotation",
    cycleAmount: 100,
    cycleDuration: 28,
    cycleDurationUnit: 'days',
    nonPayingCycles: 2,
    membersPerCycle: 5,
    started: false
  }
  try {
    const managedRotation = await createRotation(rotation)
    console.log(managedRotation)
  } catch (err) {
    console.log(`Error making rotation: ${JSON.stringify(err, null, 2)}`)
  }

}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


main()
