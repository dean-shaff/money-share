import React, { useState } from "react"
import { faUser, faLock, faAt } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./LoginRegisterContainer.js"
import InputField from "./InputField.js"


const Register = ({ history }) => {

  const [msg, setMsg] = useState('')

  const onSubmitHandler = function (evt) {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/register', {
      method: "POST",
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      console.log(`Register.onSubmitHandler: `)
      if ('message' in data) {
        setMsg(data.message)
        return
      }
      if (data.id_token !== undefined) {
        console.log('Register.onSubmitHandler: settings localStorage, directing to /dashboard')
        localStorage.setItem('token', data.id_token)
        history.push('/dashboard')
      }
    })
  }


  return (
    <form onSubmit={onSubmitHandler}>
      <LoginRegisterContainer title="Register">
        <InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>
        <InputField type="text" name="name" placeholder="Name" icon={faUser}></InputField>
        <InputField type="email" name="email" placeholder="Email" icon={faAt}></InputField>
        <InputField type="password" name="password" placeholder="Password" icon={faLock}></InputField>
        <div className="field">
          <div className="control">
            <button className="button is-link is-fullwidth">Submit</button>
          </div>
        </div>
        <div className='has-text-danger'>{msg}</div>
      </LoginRegisterContainer>
    </form>
  )
}


export default Register
