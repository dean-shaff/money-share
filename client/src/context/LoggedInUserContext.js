import React from 'react'

const LoggedInUserContext = React.createContext({
  loggedInUser: null,
  setLoggedInUser: () => {}
})

export default LoggedInUserContext
