import React from "react";
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
import DashboardContainer from "./components/Dashboard/DashboardContainer.js"
import PrivateRoute from "./components/PrivateRoute.js"
import { isLoggedIn } from "./util.js"


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
    <PrivateRoute path="/dashboard" component={DashboardContainer} to="/"/>
    <PrivateRoute path="/configuration" component={DashboardContainer} to="/"/>
    <PrivateRoute path="/members" component={DashboardContainer} to="/"/>
    <PrivateRoute path="/queue" component={DashboardContainer} to="/"/>
  </Switch>
  </Router>
);


export default App
