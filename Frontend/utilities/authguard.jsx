import React, { useEffect } from 'react'

let withAuth = (WrappedComponent) => {
    const authComponent = (props) => {
        const authenticated = () => {
            if (localStorage.getItem('token')) {
                return true;
            } else {
                return false
            }
        }


        useEffect(() => {
            if (!authenticated()) {
                window.location.href = "/";
            }
        }, []
        )
        
        if(!authenticated()) return null;
        return <WrappedComponent {...props} />
    }
    return authComponent;
}
export default withAuth
