import React from 'react'

const ResetPassword = (props) => {
  const token = props.match.params.token
  return (
    <div>
      {token}
    </div>
  )
}

export default ResetPassword
