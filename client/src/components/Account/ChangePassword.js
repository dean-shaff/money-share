import React, { useState } from "react"
import { faUser, faLock, faAt } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./../LoginRegisterContainer.js"
import InputField from "./../InputField.js"
import { authFetch, getTokenUserInfo} from "./../../util.js"


const ChangePassword = ({ history }) => {

  const [msg, setMsg] = useState('')
  const [msgClassName, setMsgClassName] = useState('has-text-danger')
  
  const [password, setPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')


  const onClick = function (evt) {
    evt.preventDefault()
    const userInfo = getTokenUserInfo()
    console.log(userInfo)
    let body = {
      'oldPassword': oldPassword,
      'password': password,
      'id': userInfo.id
    }
    authFetch('/changePassword', {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }, resp => resp)
    .then(resp => resp.json())
    .then(data => {
      if (data.message !== undefined) {
        setMsgClassName('has-text-danger')
        setMsg(data.message)
        return
      }
      if (data.id_token !== undefined) {
        console.log('ChangePassword.onSubmitHandler: settings localStorage')
        setMsgClassName('has-text-primary')
        setMsg('Successfully updated password!')
        localStorage.setItem('token', data.id_token)
      }
    })
  }

  const onChangeFactory = (setter) => {
    return (evt) => {
      let val = evt.target.value
      setter(val)
    }
  }

  let disabled = true
  if (oldPassword !== '' && password !== '') {
    disabled = false
  }

  return (
    <LoginRegisterContainer title="Change Password">
      <InputField type="password" placeholder="Old Password" value={oldPassword} onChange={onChangeFactory(setOldPassword)} icon={faLock}></InputField>
      <InputField type="password" placeholder="Password" value={password} onChange={onChangeFactory(setPassword)} icon={faLock}></InputField>
      <div className="field">
        <div className="control">
          <button className="button is-link is-fullwidth " onClick={onClick} disabled={disabled}>Update</button>
        </div>
      </div>
      <div className={msgClassName}>{msg}</div>
    </LoginRegisterContainer>
  )
}


export default ChangePassword
