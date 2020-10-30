import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import { authFetch, checkUser } from './../../util.js'
import InputField from './../InputField.js'
import FormButton from './../FormButton.js'
import LoginRegisterContainer from './../LoginRegisterContainer.js'
import Modal from './../Modal.js'
import useModal from './../../hooks/useModal.js'


const UserForm = (props) => {
  const user = props.user
  const title = props.title
  const phone = user.phone == null ? '' : user.phone

  return (
    <LoginRegisterContainer title={title}>
      <div className="field">
        <input id="admin-toggle" type="checkbox" name="admin" className="switch is-info" checked={user.admin} onChange={props.onChange}/>
        <label htmlFor="admin-toggle">Administrator</label>
      </div>
      <InputField type="text" name="username" label="Username" value={user.username} onChange={props.onChange}/>
      <InputField type="email" name="email" label="Email" value={user.email} onChange={props.onChange}/>
      <InputField type="text" name="name" label="Name" value={user.name} onChange={props.onChange}/>
      <InputField type="tel" name="phone" label="Phone" value={phone} onChange={props.onChange}/>
      {props.children}
    </LoginRegisterContainer>
  )
}

const onChangeFactory = (setter) => {
  return (evt) => {
    const name = evt.target.name
    let value = evt.target.value
    if (evt.target.type === 'checkbox') {
      value = evt.target.checked
    }

    setter(user => {
      const newUser = { ...user }
      newUser[name] = value
      return newUser
    })
  }
}

export const UserCreatePage = (props) => {

  const [msg, setMsg] = useState('')
  const [user, setUser] = useState({
    admin: false,
    username: '',
    email: '',
    name: '',
    phone: ''
  })

  const history = useHistory()

  const onClick = (evt) => {
    try {
      const userCopy = { ...user }
      checkUser(userCopy)
      authFetch(`/api/user`, {
        method: 'POST',
        body: JSON.stringify(userCopy),
        headers: {
          'Content-Type': 'application/json'
        }
      }, resp => resp)
      .then(resp => {
        if (resp.ok) {
          history.push(`/admin`)
        }
      })
    } catch (err) {
      setMsg(err.message)
    }

  }


  return (
    <div>
      <NavbarLoggedIn/>
      <UserForm title="Create User" onChange={onChangeFactory(setUser)} user={user}>
        <FormButton onClick={onClick} text="Create"/>
        <div className='has-text-danger'>{msg}</div>
      </UserForm>
    </div>
  )

}




export const UserUpdatePage = (props) => {

  const id = props.match.params.id

  const [visible, open, close] = useModal(false)

  const [initUsername, setInitUsername] = useState('')
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')

  const history = useHistory()

  useEffect(() => {
    authFetch(`/api/user/${id}`)
      .then(resp => resp.json())
      .then(data => {
        setUser(data)
        setInitUsername(data.username)
      })
  }, [])


  const handleData = data => {
    if (data.msg !== undefined) {
      setMsg(data.msg)
      return
    }
    setMsg('')
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
      .then(handleData)
    } catch (err) {
      setMsg(err.message)
    }
  }

  const onTrigger = (evt) => {
    evt.preventDefault()
    try {
      authFetch(`/api/user/${id}`, {
        method: 'DELETE'
      }, resp => resp)
      .then(resp => {
        if (resp.ok) {
          close()
          history.push('/admin')
        }
      })
    } catch (err) {
      setMsg(err.message)
    }
  }


  let form = null

  if (user !== null) {
    const phone = user.phone == null ? '' : user.phone
    form = (
      <UserForm title={`Update ${initUsername}`} user={user} onChange={onChangeFactory(setUser)}>
        <FormButton onClick={onClick} text="Update"/>
        <FormButton className="is-danger" onClick={open} text="Delete"/>
        <div className='has-text-danger'>{msg}</div>
        <Modal
          onClose={close}
          visible={visible}
          onTrigger={onTrigger}
          buttonText="Delete"
          triggerClass="is-danger"
          title={`Delete ${initUsername}`}
        >
          <p>Are you sure you want to delete this user?</p>
        </Modal>
      </UserForm>
    )
  }

  return (
    <div>
      <NavbarLoggedIn/>
      {form}
    </div>
  )
}
