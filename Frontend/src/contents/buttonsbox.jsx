import React from 'react'

export default function buttonsbox({login,guest}) {
  return (
    <div className='buttonbox'>
      <button onClick={guest}>Join as a Guest</button>
      <button onClick={login}>Login/signup</button>
    </div>
  )
}
