import React, { useEffect, useState } from 'react'
import { DateTime } from 'luxon'

import settings from './../settings.js'
import NavbarLoggedIn from './NavbarLoggedIn.js'
import { authFetch } from './../util.js'
import Modal from './Modal.js'

import './Admin.css'

const dateFormat = settings.dateFormat


const AdminTable = (props) => {
  return (
    <>
      <div className="title">{props.title}</div>
      <table className='table is-striped is-hoverable is-fullwidth'>
        {props.children}
      </table>
    </>
  )
}


const RotationsTable = (props) => {
  const rotationRow = (rot) => {
    const membersLen = rot.members.length
    let dateStartedText = "-"
    if (rot.started) {
      dateStartedText = DateTime.fromISO(rot.dateStarted).toFormat(dateFormat)
    }

    let { cycleAmount, cycleDuration, cycleDurationUnit, ...rest } = rot

    if (cycleDuration === 1) {
      cycleDurationUnit = cycleDurationUnit.slice(0, cycleDurationUnit.length - 1)
    }

    return  (
      <tr key={rot.id}>
        <td>{rot.name}</td>
        <td>{membersLen}</td>
        <td>{dateStartedText}</td>
        <td>${cycleAmount}</td>
        <td>{cycleDuration} {cycleDurationUnit}</td>
      </tr>
    )
  }

  return (
    <AdminTable title={props.title}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Number of Users</th>
          <th>Date Started</th>
          <th>Cycle Payment Amount</th>
          <th>Cycle Duration</th>
        </tr>
      </thead>
      <tbody>
        {props.rotations.map(rotationRow)}
      </tbody>
    </AdminTable>
  )
}


const UsersTable = (props) => {

  const userRow = (user) => {
    let phone = user.phone
    if (phone == null) {
      phone = "-"
    }
    const admin = user.admin ? "yes" : "no"
    return  (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{phone}</td>
        <td>{admin}</td>
      </tr>
    )
  }
  return (
    <AdminTable title={props.title}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Phone Number</th>
          <th>Admin</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.users.map(userRow)}
      </tbody>
    </AdminTable>
  )
}



const Admin = (props) => {
  // const onChange = (setter) => {
  //   return (entry, field) => {
  //     return (evt) => {
  //       let value = evt.target.value
  //       const type = evt.target.getAttribute("type")
  //       if (type === "checkbox") {
  //         value = evt.target.checked
  //       }
  //       entry[field] = value
  //       setter(arr => {
  //         const index = arr.findIndex(a => a.id === entry.id)
  //         arr[index] = entry
  //         return [...arr]
  //       })
  //     }
  //   }
  // }

  const [visible, setVisible] = useState(false)
  const [users, setUsers] = useState([])
  const [rotations, setRotations] = useState([])

  useEffect(() => {
    // get all users
    authFetch('/api/user')
      .then(resp => resp.json())
      .then(users => setUsers(users))
    // get all rotations
    authFetch('/api/rotation')
      .then(resp => resp.json())
      .then(rotations => setRotations(rotations))
  }, [])

  let userTable = null
  if (users.length > 0) {
    userTable = <UsersTable users={users} title="Users"/>
  }

  let rotationTable = null
  if (rotations.length > 0) {
    rotationTable = <RotationsTable rotations={rotations} title="Rotations"/>
  }

  return (
    <div>
      <NavbarLoggedIn/>
      <button onClick={() => {setVisible(true)}}>Click</button>
      <div className="container top-container">
        {userTable}
        {rotationTable}
      </div>
    </div>
  )
}

export default Admin
