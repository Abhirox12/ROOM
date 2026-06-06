import React from 'react'
import Home from "./home"
import Landingpage from './landing';

export default function Protectlogin() {

    let token = localStorage.getItem('token')
    if (token) {
        return <Home />
    }
    return <Landingpage />
}
