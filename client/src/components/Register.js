import React, { useState } from "react"
import { faUser, faLock, faAt, faPhone } from '@fortawesome/free-solid-svg-icons'

import LoginRegisterContainer from "./LoginRegisterContainer.js"
import InputField from "./InputField.js"
import { cleanPhone } from './../util.js'

class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      msg: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  onInputChange (evt) {
    const name = evt.target.name
    const value = evt.target.value
    this.setState({
      [name]: value
    })
  }


  onClick (evt) {

    if (this.state.username === '') {
      this.setState({
        msg: 'Please specify a username'
      })
      return
    }
    if (this.state.password === '') {
      this.setState({
        msg: 'Please specify a password'
      })
      return
    }
    if (this.state.email === '') {
      this.setState({
        msg: 'Please specify either an email address'
      })
    }

    if (this.state.phone !== '') {
      if (cleanPhone(this.state.phone).length !== 10) {
        this.setState({
          msg: 'Please include area code in phone number'
        })
        return
      }      
    }

    const {msg, ...body} = this.state
    fetch('/register', {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.message !== undefined) {
        this.setState({msg: data.message})
        return
      }
      if (data.id_token !== undefined) {
        console.log('Register.onSubmitHandler: settings localStorage, directing to /rotations')
        localStorage.setItem('token', data.id_token)
        this.props.history.push('/rotations')
        return
      }
    })
    .catch(err => {
      this.setState({msg: err.message})
    })
  }


  render() {
    return (
      <LoginRegisterContainer title="Register">
        <InputField value={this.state.username} onChange={this.onInputChange} type="text" name="username" placeholder="Username" icon={faUser}></InputField>
        <InputField value={this.state.name} onChange={this.onInputChange} type="text" name="name" placeholder="Name" icon={faUser}></InputField>
        <InputField value={this.state.email} onChange={this.onInputChange} type="email" name="email" placeholder="Email" icon={faAt}></InputField>
        <InputField value={this.state.phone} onChange={this.onInputChange} type="tel" name="phone" placeholder="Phone Number" icon={faPhone}></InputField>
        <InputField value={this.state.password} onChange={this.onInputChange} type="password" name="password" placeholder="Password" icon={faLock}></InputField>
        <div className="field">
          <div className="control">
            <button className="button is-link is-fullwidth" onClick={this.onClick}>Submit</button>
          </div>
        </div>
        <div className='has-text-danger'>{this.state.msg}</div>
      </LoginRegisterContainer>
    )
  }
}


export default Register
