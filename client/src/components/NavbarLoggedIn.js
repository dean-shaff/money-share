import React from 'react'
import { Link } from "react-router-dom";


import AppTitle from "./AppTitle.js"
import { getTokenUserInfo } from './../util.js'
import useHamburgerToggle from './../hooks/useHamburgerToggle.js'


const NavbarLoggedIn = () => {
  const username = getTokenUserInfo().username

  const onLogoutHandler = (evt) => {
    console.log('NavbarLoggedIn.onLogoutHandler')
    localStorage.removeItem('token')
  }

  const [onHamburgerClick, className] = useHamburgerToggle()

  return (
    <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <a href="/" className="navbar-item">
            <AppTitle/>
          </a>
          <a role="button"
            className={`navbar-burger burger ${className}`}
            onClick={onHamburgerClick}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
      </div>
      <div className={`navbar-menu ${className}`}>
        <div className="navbar-end">
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">{username}</a>
            <div className="navbar-dropdown is-right on-top">
              <Link className="navbar-item" to={`/rotations/managedRotation/create`}>Create New Rotation</Link>
              <hr className="navbar-divider"/>
              <Link to="/account" className="navbar-item">Account</Link>
              <hr className="navbar-divider"/>
              <Link to="/" className="navbar-item" onClick={onLogoutHandler}>Logout</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavbarLoggedIn
