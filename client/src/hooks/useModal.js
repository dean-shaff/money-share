import { useState } from 'react'

const useModal = (init) => {
  if (init === undefined) {
    init = false
  }
  const [visible, setVisible] = useState(init)
  const close = () => {
    setVisible(false)
  }
  const open = () => {
    setVisible(true)
  }

  return [visible, open, close]
}

export default useModal
