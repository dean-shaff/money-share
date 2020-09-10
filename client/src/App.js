import React from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Dashboard from "./components/Dashboard.js"


// <Route exact path="/" component={Home}  />

const App = ({ children }) => (
  <Router>
  <Switch>
    <Route exact path="/" render={() => (
      isLoggedIn() ? (
        <Redirect to="/dashboard"/>
      ) : (
        <Home />
      )
    )}/>
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/dashboard" component={Dashboard} />
  </Switch>
  </Router>
);


export default App
