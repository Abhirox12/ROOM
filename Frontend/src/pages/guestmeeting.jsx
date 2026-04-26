import React from 'react'

export default function Guestmeeting({ style, switchlogin,display }) {



  return (
    <div className='guest' style={style}>
      <div className="cross" onClick={display}>x</div>
      <h1 style={{color:"purple"}}>Join Room</h1>
      <div className="guestform">
        <form action="">
          <label htmlFor="name">Name</label> <br />
          <input type="text" id='name' name='name' /><br />
          <label htmlFor="meetingCode">Meeting Code</label> <br />
          <input type="text" id='meetingCode' name='meetingCode' />
          <br />
          <button className='join'>Join Room</button>
        </form>
        <button className='switch-to-login' onClick={switchlogin}>Login/Signup</button>
      </div>
    </div>
  )
}
