import React from 'react'

const PageNotFound = () => {
    return (
        <div style={{ display: "flex", flex: 1, justifyContent: 'center', flexDirection: "column", height: "100vh", alignItems: "center" }}>
            <h1>404</h1>
            <h3>Page not found.</h3>
            <p>You are not authorized to access this page.</p>
        </div>
    )
}

export default PageNotFound