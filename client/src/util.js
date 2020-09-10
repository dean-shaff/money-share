import jwtDecode from 'jwt-decode'

export const isLoggedIn = function () {
  const token = localStorage.getItem('token')
  if (!token) {
    return false
  }
  const tokenExpiration = jwtDecode(token).exp;
  const dateNow = new Date();
  if (tokenExpiration < dateNow.getTime()/1000){
    return false
  } else {
    return true
  }
}

export const getTokenUserInfo = function () {
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }
  const parsed = jwtDecode(token)
  return parsed
}
