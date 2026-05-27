import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/authcontext'


export default function login({ style, switchguest, displayer }) {
  const [display, setDisplay] = useState(true)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { handleLogin, handleRegister } = useContext(AuthContext)
  let loginSignupSwitch = () => {
    // console.log(display)
    setDisplay(!display)
    setName("")
    setPassword("")
  }

  let handleAuth = async (e) => {
    e.preventDefault()
    try {
      if (display === true) {
        let result = await handleLogin(username, password)
        console.log(result)
    
      }
      if (display === false) {
        let result = await handleRegister(name, username, email, password)
        console.log(result)
        loginSignupSwitch();
        setName("")
        setPassword("")
        setError("")

      }
    } catch (error) {
      let message = (error)
      setError(message)
    }
  }



  return (
    <div className='Userlog' style={style}>
      <div className="cross" onClick={displayer}>x</div>
      <h1><span style={{ color: display ? "purple" : "white", fontWeight: display ? "600" : "400" }}>Login</span>
        /
        <span style={{ color: display ? "white" : "purple", fontWeight: display ? "400" : "600" }}>Signup</span></h1>

      <div className='login' style={{ display: display ? "flex" : "none" }} >


        <div className="loginform" >
          <form action="" method='post'>
            <label htmlFor="username">Username</label> <br />
            <input type="text" id='username' name='username' value={username} onChange={(e) => setUsername(e.target.value)} /><br />
            <label htmlFor="password">Password</label> <br />
            <input type="password" id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button className='login-btn' onClick={handleAuth}>Login</button>
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
          <form action="" method='post'>
            <label htmlFor="name">Name</label> <br />
            <input type="text" id='name' name='name' value={name} onChange={(e) => setName(e.target.value)} /><br />
            <label htmlFor="username">username</label> <br />
            <input type="text" id='username' name='username' value={username} onChange={(e) => setUsername(e.target.value)} /><br />
            <label htmlFor="email">Email</label> <br />
            <input type="text" id='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />
            <label htmlFor="password">Password</label> <br />
            <input type="password" id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />



            <br />
            <button className='signup-btn' onClick={handleAuth}>Signup</button>
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
