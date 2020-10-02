import React, { useState, useEffect } from "react"
import { faUser, faLock, faAt, faPhone } from '@fortawesome/free-solid-svg-icons'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import LoginRegisterContainer from "./../LoginRegisterContainer.js"
import InputField from "./../InputField.js"
import ChangePassword from './ChangePassword.js'
import { authFetch, getTokenUserInfo, capitalize } from "./../../util.js"

const InputFieldButton = (props) => {
  return (
    <div className="control">
      <button className={`button is-info ${props.buttonClassName}`} onClick={props.onClick}>
        {props.children}
      </button>
    </div>
  )
}


class Account extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      'email': '',
      'name': '',
      'username': '',
      'phone': '',
      'msg': '',
      'emailButtonClass': '',
      'nameButtonClass': '',
      'usernameButtonClass': '',
      'phoneButtonClass': '',
    }
    this.onChange = this.onChange.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  componentDidMount () {
    const userInfo = getTokenUserInfo()
    authFetch(`/api/user/${userInfo.id}`)
      .then(resp => resp.json())
      .then(data => {
        Object.keys(data).forEach(key => {
          if (data[key] === undefined) {
            data[key] = ''
          }
        })
        this.setState(data)
      })
  }

  onChange (evt) {
    let name = evt.target.name
    let val = evt.target.value
    this.setState({
      [name]: val
    })
  }

  updateUser (name) {
    const userInfo = getTokenUserInfo()
    const buttonKeyName = `${name}ButtonClass`

    const updateUserRequest = () => {
      console.log(`updateUser: name=${name}, value=${this.state[name]}`)
      return authFetch(`/api/user/${userInfo.id}`, {
        method: 'PUT',
        body: JSON.stringify({[name]: this.state[name]}),
        headers: {
          'Content-Type': 'application/json'
        }
      }, resp => resp)
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        if (data.message !== undefined) {
          this.setState({msg: data.message})
        }
        this.setState({
          [buttonKeyName]: ''
        })
      })
    }


    return (evt) => {
      this.setState({
        [buttonKeyName]: 'is-loading'
      }, () => {
        setTimeout(() => {
          updateUserRequest()
        }, 150)
      })
    }
  }

  render () {
    const names = ['username', 'name', 'email', 'phone']
    const types = ['text', 'text', 'email', 'tel']
    const icons = [faUser, faUser, faAt, faPhone]

    let inputFields = []

    for (let idx=0; idx<names.length; idx++) {
      let [name, type, icon] = [names[idx], types[idx], icons[idx]]
      let buttonClassName = `${name}ButtonClass`
      inputFields.push((
        <div key={name} className="field">
          <label className="label">{capitalize(name)}</label>
          <div className="control">
            <InputField type={type} name={name} value={this.state[name]} onChange={this.onChange} icon={icon}>
              <InputFieldButton buttonClassName={this.state[buttonClassName]} onClick={this.updateUser(name)}>
                Update
              </InputFieldButton>
            </InputField>
          </div>
        </div>
      ))
    }

    return (
      <div>
        <NavbarLoggedIn/>
        <LoginRegisterContainer title="Account Settings">
          {inputFields}
          <div className='has-text-danger'>{this.state.msg}</div>
        </LoginRegisterContainer>
        <ChangePassword/>
      </div>
    )
  }
}


export default Account
