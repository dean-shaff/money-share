import React, { useState } from "react"
import { Link } from 'react-router-dom'

import { faAt } from '@fortawesome/free-solid-svg-icons'

import InputField from "./InputField.js"
import LoginRegisterContainer from "./LoginRegisterContainer.js"
import NavbarLoggedOut from './NavbarLoggedOut.js'


const ForgotPassword = ({ history }) => {

  const [msg, setMsg] = useState('')
  const [msgClassName, setMsgClassName] = useState('has-text-danger')

  const onSubmitHandler = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    fetch('/forgot', {
      method: 'POST',
      body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        setMsgClassName('has-text-primary')
        setMsg(`Successfully sent link to ${formData.get('email')}`)
      } else {
        setMsgClassName('has-text-danger')
        setMsg('Failed to send link')
      }
    })
  }

  return (
    <div>
    <NavbarLoggedOut/>
    <LoginRegisterContainer title="Forgot Password">
      <form onSubmit={onSubmitHandler}>
      <InputField type="email" name="email" placeholder="Email" icon={faAt}/>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-link is-fullwidth">Submit</button>
        </div>
      </div>
      <div className={msgClassName}>{msg}</div>
      </form>
    </LoginRegisterContainer>
    </div>
  )
}


export default ForgotPassword
