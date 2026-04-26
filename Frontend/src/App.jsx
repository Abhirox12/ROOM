import { useState } from 'react'
import Landingpage from './pages/landing'
import { Routes,BrowserRouter as Router, Route } from "react-router-dom"
import './App.css'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Landingpage />}></Route>

        </Routes>
      </Router>
    </>
  )
}

export default App
