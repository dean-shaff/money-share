import React from "react"
import { faUser, faLock, faAt } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./LoginRegisterContainer.js"
import InputField from "./InputField.js"


const Register = ({ history }) => {
  const onSubmitHandler = function (evt) {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/api/user', {
      method: "POST",
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      localStorage.setItem('token', data.id_token)
      history.push('/dashboard')
    })
  }


  return (
    <form onSubmit={onSubmitHandler}>
      <LoginRegisterContainer title="Register">
        <InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>
        <InputField type="email" name="email" placeholder="Email" icon={faAt}></InputField>
        <InputField type="password" name="password" placeholder="Password" icon={faLock}></InputField>
        <div className="field">
          <div className="control">
            <button className="button is-link is-fullwidth">Submit</button>
          </div>
        </div>
      </LoginRegisterContainer>
    </form>
  )
}


export default Register
