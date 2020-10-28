import React, { useContext, useEffect } from 'react'
import { Link } from "react-router-dom";


import AppTitle from "./AppTitle.js"
import { getTokenUserInfo, authFetch } from './../util.js'
import useHamburgerToggle from './../hooks/useHamburgerToggle.js'
import LoggedInUserContext from './../context/LoggedInUserContext.js'


const NavbarLoggedIn = () => {

  const { loggedInUser, setLoggedInUser } = useContext(LoggedInUserContext)

  useEffect(() => {
    if (loggedInUser === null) {
      const id = getTokenUserInfo().id
      authFetch(`/api/user/${id}`)
        .then(resp => resp.json())
        .then(data => setLoggedInUser(data))
    }
  }, [])


  const onLogoutHandler = (evt) => {
    console.log('NavbarLoggedIn.onLogoutHandler')
    localStorage.removeItem('token')
  }

  const [onHamburgerClick, className] = useHamburgerToggle()

  let username = ''
  let adminLink = null

  if (loggedInUser !== null) {
    username = loggedInUser.username
    if (loggedInUser.admin) {
      adminLink = (
        <>
        <Link to="/admin" className="navbar-item">Admin</Link>
        <hr className="navbar-divider"/>
        </>
      )
    }
  }


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
              {adminLink}
              <Link to="/" className="navbar-item" onClick={onLogoutHandler}>Logout</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavbarLoggedIn
