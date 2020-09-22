import React, { useState } from "react"
import { faUser, faLock, faAt } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./LoginRegisterContainer.js"
import InputField from "./InputField.js"
import { authFetch, getTokenUserInfo} from "./../util.js"


const ChangePassword = ({ history }) => {

  const [msg, setMsg] = useState('')

  const onSubmitHandler = function (evt) {
    evt.preventDefault()
    const userInfo = getTokenUserInfo()
    const formData = new FormData(evt.target)
    formData.append('id', userInfo.id)
    authFetch('/changePassword', {
      method: "POST",
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.id_token !== undefined) {
        console.log('ChangePassword.onSubmitHandler: settings localStorage, directing to /rotations')
        localStorage.setItem('token', data.id_token)
        history.push('/rotations')
      }
    })
    .catch(err => {
      setMsg(err.message)
    })
  }


  return (
    <form onSubmit={onSubmitHandler}>
      <LoginRegisterContainer title="Change Password">
        <InputField type="password" name="oldPassword" placeholder="Old Password" icon={faLock}></InputField>
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


export default ChangePassword
