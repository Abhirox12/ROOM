import React from 'react'
import '../App.css'

export default function Error({ display, style,joinMeet }) {

    return (
        <div className='error' style={style}>
            <div className="errorCross" onClick={display}>x</div>
            <div className="errorBox">

                <h3>
                    {joinMeet?"Please Enter the Code":"Invalid code. Please try with a valid code"}
                </h3>
            </div>
        </div>
    )
}
