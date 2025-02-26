import React from 'react'
import { getUserRole } from '../hooks/useUser'
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoutes = () => {
    const role = getUserRole();

    return role == "Admin" ? <Outlet /> : <Navigate to={"/unauthorized"} />
}

export default AdminRoutes