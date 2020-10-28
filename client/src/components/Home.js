import React, { useState } from "react"

import AppTitle from "./AppTitle.js"
import NavbarLoggedOut from './NavbarLoggedOut.js'
import version from './../version.js'

const Home = () => {

  return (
    <div>
    <NavbarLoggedOut/>
    <section className="hero is-large">
      <div className="hero-body">
      <h1 className="title is-h1">Manage your Money Share!</h1>
      </div>
    </section>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>Client Version {version}</p>
      </div>
    </footer>
    </div>
  )
}


export default Home
