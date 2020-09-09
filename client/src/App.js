import React from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Home from "./components/Home.js"

const App = ({ children }) => (
  <Router>
  <Switch>
    <Route exact path="/" component={Home}  />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
  </Switch>
  </Router>
);


export default App
