import React, { useEffect, useState } from 'react'

import { authFetch } from './../util.js'


const Admin = (props) => {

  const [users, setUsers] = useState([])
  const [rotations, setRotations] = useState([])

  useEffect(() => {
    // get all users
    authFetch('/api/user').then(resp => resp.json()).then(users => setUsers(users))
    authFetch('/api/rotation').then(resp => resp.json()).then(rotations => setRotations(rotations))
    // get all rotations
  }, [])

  console.log(users)
  console.log(rotations)

  return (
    <div>
      {users.length}
      <hr/>
      {rotations.length}
    </div>
  )


}

export default Admin
