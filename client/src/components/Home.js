import React from "react"


const Home = () => {
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
