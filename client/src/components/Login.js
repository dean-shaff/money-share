import React from "react"

import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'

import InputField from "./InputField.js"
import LoginRegisterContainer from "./LoginRegisterContainer.js"


const Login = ({ history }) => {

  const onSubmitHandler = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/login', {
      method: 'POST',
      body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
      localStorage.setItem('token', data.id_token)
      history.push('/dashboard')
    })
  }


  return (
    <LoginRegisterContainer title="Login">
      <form onSubmit={onSubmitHandler}>
      <InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>
      <InputField type="password" name="password" placeholder="Password" icon={faLock}></InputField>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-link is-fullwidth">Login</button>
        </div>
      </div>
      </form>
    </LoginRegisterContainer>
  )
}


export default Login
