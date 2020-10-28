import React, { useEffect, useState } from 'react'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import { authFetch, checkUser } from './../../util.js'
import InputField from './../InputField.js'
import LoginRegisterContainer from './../LoginRegisterContainer.js'


const UserPage = (props) => {

  const id = props.match.params.id

  const [initUsername, setInitUsername] = useState('')
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    authFetch(`/api/user/${id}`)
      .then(resp => resp.json())
      .then(data => {
        setUser(data)
        setInitUsername(data.username)
      })
  }, [])

  const onChange = (evt) => {
    const name = evt.target.name
    let value = evt.target.value
    if (evt.target.checked !== undefined) {
      value = evt.target.checked
    }

    setUser(user => {
      const newUser = { ...user }
      newUser[name] = value
      return newUser
    })
  }

  const onClick = (evt) => {
    try {
      const userCopy = { ...user }
      checkUser(userCopy)
      authFetch(`/api/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userCopy),
        headers: {
          'Content-Type': 'application/json'
        }
      }, resp => resp)
      .then(resp => resp.json())
      .then(data => {
        if (data.msg !== undefined) {
          setMsg(data.msg)
          return
        }
        setMsg('')
      })
    } catch (err) {
      setMsg(err.message)
    }
  }


  let form = null

  if (user !== null) {
    const phone = user.phone == null ? '' : user.phone
    form = (
      <LoginRegisterContainer title={`Update ${initUsername}`}>
        <div className="field">
          <input id="admin-toggle" type="checkbox" name="admin" className="switch is-info" checked={user.admin} onChange={onChange}/>
          <label htmlFor="admin-toggle">Administrator</label>
        </div>
        <InputField type="text" name="username" label="Username" value={user.username} onChange={onChange}/>
        <InputField type="email" name="email" label="Email" value={user.email} onChange={onChange}/>
        <InputField type="text" name="name" label="Name" value={user.name} onChange={onChange}/>
        <InputField type="tel" name="phone" label="Phone" value={phone} onChange={onChange}/>
        <div className="field">
          <div className="control">
            <button onClick={onClick} className="button is-link is-fullwidth">Update</button>
          </div>
        </div>
        <div className='has-text-danger'>{msg}</div>
      </LoginRegisterContainer>
    )
  }

  return (
    <div>
      <NavbarLoggedIn/>
      {form}
    </div>
  )
}

export default UserPage
