import { useState } from 'react'

const useHamburgerToggle = () => {
  // const [navbarMenuClassName, setNavbarMenuClassName] = useState('')
  const [className, setClassName] = useState('')

  const onHamburgerClick = (evt) => {
    evt.preventDefault()
    if (className === '') {
      setClassName('is-active')
      // setNavbarMenuClassName('is-active')
      // setHamburgerClassName('is-active')
    } else {
      setClassName('')
      // setNavbarMenuClassName('')
      // setHamburgerClassName('')
    }
  }

  return [onHamburgerClick, className]
}

export default useHamburgerToggle
