import { useState } from 'react'
import Landingpage from './pages/landing'
import { AuthProvider } from '../context/authcontext'
import { Routes, BrowserRouter as Router, Route } from "react-router-dom"
import './App.css'

function App() {

  return (
    <>
      <Router>
        <AuthProvider >
          <Routes>
            <Route path='/' element={<Landingpage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
