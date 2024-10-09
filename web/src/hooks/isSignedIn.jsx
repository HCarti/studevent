const signedIn = () => {
    const user = localStorage.getItem("user")
    const userData = JSON.parse(user)

    if (user) return true;

    return false;
}

export { signedIn }