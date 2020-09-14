import React from "react"

import { getTokenUserInfo } from "./../util.js"


class Dashboard extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      username: null
    }
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
  }

  componentDidMount() {
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username
    })
  }

  onLogoutHandler (evt) {
    localStorage.removeItem('token')
    this.props.history.push('/')
  }

  render () {
    return (
      <div>
      <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a href="/" className="navbar-item">
              <h1 className="title is-1">Money Share App</h1>
            </a>
          </div>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <button className="button is-primary" onClick={this.onLogoutHandler}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section className="section">
        <div className="container">
          <h1 className="title is-1">Hello {this.state.username}</h1>
        </div>
      </section>
      </div>
    )
  }
}


export default Dashboard
