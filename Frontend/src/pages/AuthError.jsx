import React from 'react'
import '../App.css'

export default function AuthError({ display, style, errorText }) {
    return (
        <div className='autherror' style={style}>
            <div className="errorCross" onClick={display}>x</div>
            <div className="errorBox">
                <h3>
                    {errorText}
                </h3>
            </div>
        </div>
    )
}
