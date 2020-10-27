import React, { useState } from "react"
import { Link } from 'react-router-dom'

import { faAt, faLock } from '@fortawesome/free-solid-svg-icons'

import InputField from "./InputField.js"
import LoginRegisterContainer from "./LoginRegisterContainer.js"


const ForgotPassword = ({ history }) => {

  const [msg, setMsg] = useState('')

  const onSubmitHandler = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/forgot', {
      method: 'POST',
      body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
      console.log(data)
    })
  }

  return (
    <LoginRegisterContainer title="Forgot Password">
      <form onSubmit={onSubmitHandler}>
      <InputField type="email" name="email" placeholder="Email" icon={faAt}></InputField>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-link is-fullwidth">Submit</button>
        </div>
      </div>
      <div className='has-text-danger'>{msg}</div>
      </form>
    </LoginRegisterContainer>
  )
}


export default ForgotPassword
