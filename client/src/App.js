import React, { useState } from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
} from "react-router-dom";


import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import { Admin } from './components/Admin/'
import ForgotPassword from './components/ForgotPassword.js'
import ResetPassword from './components/ResetPassword.js'
import { Rotations } from "./components/Rotations/"
import { Account } from './components/Account/'
import PrivateRoute from "./components/PrivateRoute.js"
import { isLoggedIn } from "./util.js"
import LoggedInUserContext from './context/LoggedInUserContext.js'


const App = () => {

  const [loggedInUser, setLoggedInUser] = useState(null)
  const value = { loggedInUser, setLoggedInUser }

  return (
    <LoggedInUserContext.Provider value={value}>
      <Router>
        <Switch>
          <Route exact path="/" render={() => (
            isLoggedIn() ? (
              <Redirect to="/rotations"/>
            ) : (
              <Home />
            )
          )}/>
          <Route path="/login" component={Login} />
          <Route path="/forgot" component={ForgotPassword} />
          <Route path="/reset/:token" component={ResetPassword} />
          <Route path="/register" component={Register} />
          <PrivateRoute path="/admin" component={Admin} to="/"/>
          <PrivateRoute path="/rotations" component={Rotations} to="/"/>
          <PrivateRoute path="/account" component={Account} to="/"/>
        </Switch>
      </Router>
    </LoggedInUserContext.Provider>
  )
}


export default App
