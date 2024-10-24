// src/components/UserCounter.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SuperAdminUserCounter = () => {
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await axios.get('https://studevent-server.vercel.app/api/users/count');
                setUserCount(response.data.count);
            } catch (error) {
                console.error('Error fetching user count:', error);
            }
        };

        fetchUserCount();
    }, []);

    return (
        <div>
            <h3>Total Users: {userCount}</h3>
        </div>
    );
};

export default SuperAdminUserCounter;
