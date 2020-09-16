import React from 'react'

const User = (props) => {

  let isPaidText = props.user.paid ? 'Paid!' : 'Not Paid!'

  return (
    <div className="box">
      <p className="title">{props.user.name}</p>
      <p>{isPaidText}</p>
    </div>
  )
}

export default User
