import React, { useState } from 'react'


export default function login({ style, switchguest,displayer }) {
  const [display, setDisplay] = useState(true)
  let loginSignupSwitch = () => {
    // console.log(display)
    setDisplay(!display)
  }
  return (
    <div className='Userlog' style={style}>
      <div className="cross" onClick={displayer}>x</div>
      <h1><span style={{ color: display ? "purple" : "white", fontWeight: display ? "600" : "400" }}>Login</span>
        /
        <span style={{ color: display ? "white" : "purple", fontWeight: display ? "400" : "600" }}>Signup</span></h1>

      <div className='login' style={{ display: display ? "flex" : "none" }} >


        <div className="loginform" >
          <form action="">
            <label htmlFor="username">Username</label> <br />
            <input type="text" id='username' name='username' /><br />
            <label htmlFor="password">Password</label> <br />
            <input type="text" id='password' name='password' />
            <br />
            <button className='login-btn'>Login</button>
            <button className='forget-password'>Forget password?</button>
          </form>
          <div className='btn'>
            <button className='switch-to-guest' onClick={switchguest}>Guestlogin</button>
            <button className='Switch-to-signup-btn' onClick={loginSignupSwitch}>Signup</button>
          </div>
        </div>
      </div>

      <div className='signup' style={{ display: display ? "none" : "flex" }}>
        <div className="signupform" >
          <form action="">
            <label htmlFor="name">Name</label> <br />
            <input type="text" id='name' name='name' /><br />
            <label htmlFor="username">username</label> <br />
            <input type="text" id='username' name='username' /><br />
            <label htmlFor="email">Email</label> <br />
            <input type="text" id='email' name='email' /><br />
            <label htmlFor="password">Password</label> <br />
            <input type="text" id='password' name='password' />



            <br />
            <button className='signup-btn'>Signup</button>
          </form>
          <div className='btn'>
            <button className='switch-to-guest' onClick={switchguest}>Guestlogin</button>
            <button className='switch-to-login' onClick={loginSignupSwitch} >Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}
