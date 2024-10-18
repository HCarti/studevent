import React from 'react'
import { getUserRole } from '../hooks/useUser'
import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminRoutes = () => {
    const role = getUserRole();

    return role == "SuperAdmin" ? <Outlet /> : <Navigate to={"/unauthorized"} />
}

export default SuperAdminRoutes