import React, { useEffect, useState } from 'react'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import { authFetch, checkUser } from './../../util.js'
import InputField from './../InputField.js'
import LoginRegisterContainer from './../LoginRegisterContainer.js'
import UsersTable from './UsersTable.js'
import CreateUpdateRotationForm from './../Rotations/ManagedRotation/CreateUpdateRotationForm.js'


const RotationPage = (props) => {

  const id = props.match.params.id

  const [initName, setInitName] = useState('')
  const [rotation, setRotation] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    authFetch(`/api/rotation/${id}`)
      .then(resp => resp.json())
      .then(data => {
        setRotation(data)
        console.log(data)
        setInitName(data.name)
      })
  }, [])

  const onChange = (evt) => {
    const name = evt.target.name
    let value = evt.target.value

    setRotation(rotation => {
      const newRotation = { ...rotation }
      newRotation[name] = value
      return newRotation
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

  if (rotation !== null) {
    console.log(rotation)
    form = (
      <div className="container top-container">
        <div className="columns">
          <div className="column is-4 is-offset-4">
            <CreateUpdateRotationForm
              { ...rotation }
              readOnly={true}
              errorMsg={msg}
              onInputChange={onChange}
              // onSaveClick={onClick}
            />
          </div>
        </div>
        <UsersTable title="Manager" users={[rotation.manager]}/>
        <UsersTable title="Members" users={rotation.members}/>
      </div>
    )
  }

  return (
    <div>
      <NavbarLoggedIn/>
      {form}
    </div>
  )
}

export default RotationPage
