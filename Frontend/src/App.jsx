import { useState } from 'react'
import Landingpage from './pages/landing'
import { AuthProvider } from '../context/authcontext'
import Videomeet from './pages/videomeet'
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
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
