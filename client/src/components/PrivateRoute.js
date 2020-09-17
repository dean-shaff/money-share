import React from "react"
import { render } from "react-dom"
import {
  Redirect,
  Route,
} from "react-router-dom"

import { isLoggedIn } from "./../util.js"


const PrivateRoute = ({ component: Component, ...rest }) => {
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

export default PrivateRoute
