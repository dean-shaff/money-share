import React, { useEffect, useState } from 'react'
import { Switch, Route } from "react-router-dom";
import { DateTime } from 'luxon'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import { authFetch } from './../../util.js'
import { AdminTableWithNew, AdminTable } from './AdminTable.js'
import RotationsTable from './RotationsTable.js'
import UsersTable from './UsersTable.js'
import { UserUpdatePage, UserCreatePage } from './UserPage.js'
import RotationPage from './RotationPage.js'

import './Admin.css'

const AdminDashboard = (props) => {

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
    userTable = <UsersTable users={users} title="Users" component={AdminTableWithNew}/>
  }

  let rotationTable = null
  if (rotations.length > 0) {
    rotationTable = <RotationsTable rotations={rotations} title="Rotations" component={AdminTable}/>
  }

  return (
    <div>
      <NavbarLoggedIn/>
      <div className="container top-container">
        {userTable}
        {rotationTable}
      </div>
    </div>
  )
}

const Admin = (props) => {
  return (
    <div>
      <Switch>
        <Route exact path={`${props.match.path}`} component={AdminDashboard}/>
        <Route exact path={`${props.match.path}/user/create`} component={UserCreatePage}/>
        <Route path={`${props.match.path}/user/:id`} component={UserUpdatePage}/>
        <Route exact path={`${props.match.path}/rotation/create`} component={RotationPage}/>
        <Route path={`${props.match.path}/rotation/:id`} component={RotationPage}/>
      </Switch>
    </div>
  )
}


export default Admin
