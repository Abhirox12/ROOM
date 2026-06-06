import { useState, useContext } from 'react'
import Landingpage from './pages/landing'
import Protectlogin from './pages/protectlogin'
import { AuthProvider } from '../context/authcontext'
import ProtectedMeeting from './pages/ProtectedMeeting'
import Home from './pages/home'
import { useParams } from 'react-router-dom'
import { Routes, BrowserRouter as Router, Route } from "react-router-dom"
import './App.css'
import VideoMeet from './pages/videomeet'

function App() {

  return (
    <>
      <Router>
        <AuthProvider >
          <Routes>
            <Route path='/' element={<Protectlogin />} />
            <Route path='/:meetingCode' element={<ProtectedMeeting />} />
            <Route path='/home' element={<Protectlogin />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
