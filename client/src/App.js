import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";


import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"

const App = ({ children }) => (
  <div>
  <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
    <div className="container">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <h1 className="title is-1">Money Share App</h1>
        </Link>
      </div>
    </div>
    <div className="navbar-menu">
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            <Link to="register/" className="button is-primary">Sign Up</Link>
            <Link to="login/" className="button is-light">Login</Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <Router>
    <Home path="/" />
    <Login path="login/" />
    <Register path="register/" />
  </Router>
  </div>
);


export default App
