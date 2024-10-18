import React from 'react'
import { getUserRole } from '../hooks/useUser'
import { Navigate, Outlet } from 'react-router-dom';

const MemberRoutes = () => {
    const role = getUserRole();

    return role == "Organization" ? <Outlet /> : <Navigate to={"/unauthorized"} />
}

export default MemberRoutes