import React, { useState } from 'react';
import { Plus, Check, Minus } from 'lucide-react';
import avatarFallback from '../assets/img/avatarfallback.png';
import './UserCard.css';

const UserCard = ({ user, currentUserId, onFollow, onUnfollow, showFollowButton = true }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (user.userId === currentUserId) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow(user.userId);
        setIsFollowing(false);
      } else {
        await onFollow(user.userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowButton = () => {
    if (!showFollowButton || user.userId === currentUserId) return null;
    
    if (isFollowing) {
      return (
        <button
          className="follow-button following"
          onClick={handleFollowToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <Check size={16} />
              Following
            </>
          )}
        </button>
      );
    } else {
      return (
        <button
          className="follow-button follow"
          onClick={handleFollowToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <Plus size={16} />
              Follow
            </>
          )}
        </button>
      );
    }
  };

  return (
    <div className="user-card">
      <div className="user-card-avatar">
        <img 
          src={user.avatarUrl || avatarFallback} 
          alt={user.username}
        />
      </div>
      
      <div className="user-card-info">
        <div className="user-card-header">
          <span className="user-card-username">{user.username}</span>
          {user.isVerified && (
            <span className="verified-badge">✓</span>
          )}
        </div>
        
        {user.fullName && (
          <span className="user-card-fullname">{user.fullName}</span>
        )}
        
        {user.bio && (
          <p className="user-card-bio">{user.bio}</p>
        )}
        
        <div className="user-card-stats">
          <span className="stat">
            <strong>{user.postsCount || 0}</strong> posts
          </span>
          <span className="stat">
            <strong>{user.followersCount || 0}</strong> followers
          </span>
          <span className="stat">
            <strong>{user.followingCount || 0}</strong> following
          </span>
        </div>
      </div>
      
      {getFollowButton()}
    </div>
  );
};

export default UserCard;

