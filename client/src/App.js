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
import Dashboard from "./components/Dashboard.js"
import { isLoggedIn } from "./util.js"


// <Route path="/dashboard" component={Dashboard} />

const PrivateRoute = ({ component: Component, ...rest }) => {
  console.log(rest)
  let {to, ..._rest} = rest
  if (! to) {
    to = '/login'
  }
  return (
    <Route
      {..._rest}
      render={props =>
        isLoggedIn() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: to, state: { from: props.location } }} />
        )
      }
    />
  )
}

// <Route path="/dashboard" render={() => (
//   isLoggedIn() ? (
//     <Dashboard/>
//   ) : (
//     <Redirect to="/"/>
//   )
// )}/>
// <Route exact path="/" render={() => (
//   isLoggedIn() ? (
//     <Redirect to="/dashboard"/>
//   ) : (
//     <Home />
//   )
// )}/>
// <Route exact path="/" component={Home} />

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
    <PrivateRoute path="/dashboard" component={Dashboard} to="/"/>
  </Switch>
  </Router>
);


export default App
