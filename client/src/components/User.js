import React from 'react'

const User = (props) => {
  return (
    <div className="card">
      <div className="card-content">
        <p>{props.name}</p>
      </div>
    </div>
  )
}

export default User
