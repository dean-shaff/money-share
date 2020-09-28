import React, { useState } from "react"

import AppTitle from "./AppTitle.js"

const Home = () => {
  return (
    <div>
    <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a href="/" className="navbar-item">
          <AppTitle/>
        </a>
        <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="mainNavbar">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div className="navbar-menu" id="mainNavbar">
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
    <section className="hero is-large">
      <div className="hero-body">
      <h1 className="title is-h1">Manage your Money Share!</h1>
      </div>
    </section>
    </div>
  )
}


export default Home
