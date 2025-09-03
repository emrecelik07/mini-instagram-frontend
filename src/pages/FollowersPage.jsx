import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppContext } from "../context/AppContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import UserCard from "../components/UserCard.jsx";
import "./FollowersPage.css";

function FollowersPage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { api, userData } = useContext(AppContext);
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFollowers();
    }, [username, api]);

    const fetchFollowers = async () => {
        try {
            setIsLoading(true);
            
            // First, search for the user by username
            const searchResponse = await api.get(`/search?q=${username}`);
            const users = searchResponse.data;
            const targetUser = users.find(u => u.username === username);
            
            if (!targetUser) {
                console.error('User not found');
                return;
            }
            
            // Get followers for the target user
            const followersResponse = await api.get(`/follows/followers/${targetUser.userId}`);
            const followersData = followersResponse.data;

            const followersWithStatus = await Promise.all(
                followersData.map(async (follower) => {
                    if (userData && userData.userId !== follower.userId) {
                        try {
                            const followCheckResponse = await api.get(`/follows/check/${follower.userId}`);
                            const isFollowing = followCheckResponse.data;
                            return { ...follower, isFollowing };
                        } catch (error) {
                            console.error('Error checking follow status:', error);
                        }
                    }
                    return { ...follower, isFollowing: false };
                })
            );
            
            setFollowers(followersWithStatus);
        } catch (error) {
            console.error('Error fetching followers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await api.post('/follows/follow', { followingUserId: userId });
            setFollowers(prev => 
                prev.map(follower => 
                    follower.userId === userId 
                        ? { ...follower, isFollowing: true }
                        : follower
                )
            );
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await api.post('/follows/unfollow', { followingUserId: userId });
            setFollowers(prev => 
                prev.map(follower => 
                    follower.userId === userId 
                        ? { ...follower, isFollowing: false }
                        : follower
                )
            );
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="followers-page">
                <AppNavbar />
                <div className="loading-container">
                    <Loader2 size={32} className="spinner" />
                    <p>Loading followers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="followers-page">
            <AppNavbar />
            
            <div className="followers-content">
                <div className="followers-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1>{username}'s Followers</h1>
                </div>

                <div className="followers-list">
                    {followers.length === 0 ? (
                        <div className="empty-followers">
                            <h3>No followers yet</h3>
                            <p>This user doesn't have any followers yet.</p>
                        </div>
                    ) : (
                        followers.map(follower => (
                            <UserCard
                                key={follower.userId}
                                user={follower}
                                currentUserId={userData?.userId}
                                onFollow={handleFollow}
                                onUnfollow={handleUnfollow}
                                showFollowButton={userData?.userId !== follower.userId}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default FollowersPage;

