import { useState } from 'react'
import Landingpage from './pages/landing'
import { AuthProvider } from '../context/authcontext'
import Videomeet from './pages/videomeet'
import Home from './pages/home'
import { Routes, BrowserRouter as Router, Route } from "react-router-dom"
import './App.css'

function App() {

  return (
    <>
      <Router>
        <AuthProvider >
          <Routes>
            <Route path='/' element={<Landingpage />} />
            <Route path='/:roomid' element={<Videomeet />} />
            <Route path='/home' element={<Home />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
