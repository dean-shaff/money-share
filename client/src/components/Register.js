import React from "react"
import { faUser, faLock, faAt } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./LoginRegisterContainer.js"
import InputField from "./InputField.js"

const Register = () => {
  return (
      <LoginRegisterContainer title="Register">
        <InputField type="text" placeholder="Username" icon={faUser}></InputField>
        <InputField type="email" placeholder="Email" icon={faAt}></InputField>
        <InputField type="password" placeholder="Password" icon={faLock}></InputField>
        <InputField type="password" placeholder="Repeat Password" icon={faLock}></InputField>
        <div className="field">
          <div className="control">
            <button className="button is-link is-fullwidth">Submit</button>
          </div>
        </div>
      </LoginRegisterContainer>
  )
}


export default Register
