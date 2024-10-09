const getUserRole = () => {
    const user = localStorage.getItem("user")

    if (!user) return null

    //parse the data so that it can be used to protect routes
    const userData = JSON.parse(user)
    return userData.role;
}

const getUserData = () => {
    const user = localStorage.getItem("user")

    if (!user) return null

    //parse the data so that it can be used to protect routes
    const userData = JSON.parse(user)
    return userData
}




export { getUserRole, getUserData }