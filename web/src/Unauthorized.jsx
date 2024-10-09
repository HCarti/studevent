import React from 'react'

const Unauthorized = () => {
    return (
        <div style={{ display: "flex", flex: 1, justifyContent: 'center',flexDirection:"column",height:"100vh", alignItems: "center" }}>
            <h1>Unauthorized</h1>
            <p>You are not authorized to access this page.</p>
        </div>
    )
}

export default Unauthorized