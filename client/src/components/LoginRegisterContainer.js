import React from "react"

const LoginRegisterContainer = (props) => {
  return (
    <div className="container top-container">
      <div className="column is-4 is-offset-4">
        <div className="box">
          <h2 className="title is-2 has-text-centered">{props.title}</h2>
          {props.children}
        </div>
      </div>
    </div>
  )
}


export default LoginRegisterContainer
