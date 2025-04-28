// src/pages/LikesReceived.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';


function LikesReceived() {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await axiosInstance.get('/user/likes-received');

                setLikes(response.data);
            } catch (error) {
                console.error("Error fetching likes received:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikes();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (likes.length === 0) return <p>No pending likes yet!</p>;

    return (
        <div>
            <h1>People who liked you</h1>
            <ul>
                {likes.map((user) => (
                    <li key={user.username}>
                        {user.name} ({user.age} years old) - @{user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LikesReceived;