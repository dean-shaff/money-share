import React from 'react'

const User = (props) => {
  return (
    <div className="box">
      <p className="title">{props.user.name}</p>
      <p>{props.user.username}</p>
    </div>
  )
}

export default User
