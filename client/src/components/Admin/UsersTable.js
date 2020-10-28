import React from 'react'

import AdminTable from './AdminTable.js'

const userRow = (user) => {
  let phone = user.phone
  if (phone == null) {
    phone = "-"
  }
  const admin = user.admin ? "yes" : "no"
  return [user.name, user.username, user.email, phone, admin]
}

const labels = [
  "Name",
  "Username",
  "Email",
  "Phone Number",
  "Admin"
]


const UsersTable = (props) => {
  return (
    <AdminTable
      title={props.title}
      getRow={userRow}
      labels={labels}
      data={props.users}
      subDomain="user"/>
  )
}

export default UsersTable
