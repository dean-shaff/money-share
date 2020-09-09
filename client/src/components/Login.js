import React from "react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'

import InputField from "./InputField.js"
import LoginRegisterContainer from "./LoginRegisterContainer.js"


const Login = () => {
  return (
    <LoginRegisterContainer title="Login">
      <InputField type="text" placeholder="Username" icon={faUser}></InputField>
      <InputField type="password" placeholder="Password" icon={faLock}></InputField>
      <div className="field">
        <div className="control">
          <button className="button is-link is-fullwidth">Login</button>
        </div>
      </div>
    </LoginRegisterContainer>
  )
}


export default Login
