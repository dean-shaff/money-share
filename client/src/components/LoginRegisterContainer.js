import React from "react"

const LoginRegisterContainer = (props) => {
  return (
    <section className="section">
      <div className="container has-text-centered">
      <div className="column is-4 is-offset-4">
        <div className="box">
        <h2 className="title is-2">{props.title}</h2>
          {props.children}
        </div>
        </div>
      </div>
    </section>
  )
}


export default LoginRegisterContainer
