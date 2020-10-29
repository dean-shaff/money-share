import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { faLock } from '@fortawesome/free-solid-svg-icons'

import NavbarLoggedOut from './NavbarLoggedOut.js'
import LoginRegisterContainer from './LoginRegisterContainer.js'
import InputField from './InputField.js'


const ResetPassword = (props) => {
  const token = props.match.params.token
  const [msg, setMsg] = useState('')

  const history = useHistory()

  const onSubmitHandler = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.target)
    formData.set('token', token)
    fetch('/reset', {
      method: 'POST',
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.id_token !== undefined) {
        localStorage.setItem('token', data.id_token)
        history.push('/rotations')
      } else {
        setMsg('Error occured')
      }
    })
  }



  return (
    <div>
    <NavbarLoggedOut/>
    <LoginRegisterContainer title="Reset Password">
      <form onSubmit={onSubmitHandler}>
      <InputField type="password" name="password" placeholder="New Password" icon={faLock}/>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-link is-fullwidth">Submit</button>
        </div>
      </div>
      <div className='has-text-danger'>{msg}</div>
      </form>
    </LoginRegisterContainer>
    </div>
  )
}

export default ResetPassword
