import React, { useState } from "react"

import AppTitle from "./AppTitle.js"
import useHamburgerToggle from './../hooks/useHamburgerToggle.js'

const NavbarLoggedOut = () => {

  const [onHamburgerClick, className] = useHamburgerToggle()

  return (
    <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
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
      <div className={`navbar-menu ${className}`} id="mainNavbar">
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <a href="/register" className="button is-primary">Sign Up</a>
              <a href="/login" className="button is-light">Login</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}


export default NavbarLoggedOut
