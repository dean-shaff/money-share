import React, { useState, useContext } from "react"
import { Link } from 'react-router-dom'

import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'

import InputField from "./InputField.js"
import LoginRegisterContainer from "./LoginRegisterContainer.js"
import LoggedInUserContext from './../context/LoggedInUserContext.js'
import NavbarLoggedOut from './NavbarLoggedOut.js'
import { getTokenUserInfo, authFetch } from './../util.js'


const Login = ({ history }) => {

  const { loggedInUser, setLoggedInUser } = useContext(LoggedInUserContext)
  const [msg, setMsg] = useState('')

  const onSubmitHandler = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/login', {
      method: 'POST',
      body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
      if ('message' in data) {
        setMsg(data.message)
        return
      }
      if (data.id_token !== undefined) {
        localStorage.setItem('token', data.id_token)
        history.push('/rotations')
      }
    })
  }


  return (
    <div>
      <NavbarLoggedOut/>
      <LoginRegisterContainer title="Login">
        <form onSubmit={onSubmitHandler}>
        <InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>
        <InputField type="password" name="password" placeholder="Password" icon={faLock}></InputField>
        <div className="field">
          <div className="control">
            <button type="submit" className="button is-link is-fullwidth">Login</button>
          </div>
        </div>
        <Link to="/forgot">Forgot Password</Link>
        <div className='has-text-danger'>{msg}</div>
        </form>
      </LoginRegisterContainer>
    </div>
  )
}


export default Login
