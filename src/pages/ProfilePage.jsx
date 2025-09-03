import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Image, Card, Nav, Navbar } from 'react-bootstrap';
import { Edit, Grid3X3, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { AppConstants } from '../util/constants.js';
import AppNavbar from '../components/AppNavbar.jsx';
import Post from '../components/Post.jsx';
import avatarFallback from '../assets/img/avatarfallback.png';
import './ProfilePage.css';

const ProfilePage = () => {
  const { api, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (userData) {
      fetchProfile();
      fetchUserPosts();
      fetchLikedPosts();
      fetchSavedPosts();
    }
  }, [userData]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get(`/posts/user/${userData.userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      const response = await api.get('/posts/liked');
      setLikedPosts(response.data);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await api.get('/posts/saved');
      setSavedPosts(response.data);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const handlePostCreated = () => {
    fetchUserPosts();
    if (profile) {
      setProfile(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
    }
  };

  const renderPosts = (postsList) => {
    if (loading) {
      return <div className="loading-container">Loading...</div>;
    }

    if (postsList.length === 0) {
      return (
        <div className="empty-tab">
          <h3>No posts yet</h3>
          <p>When you share photos and videos, they'll appear on your profile.</p>
        </div>
      );
    }

    return (
      <div className="posts-container">
        {postsList.map((post) => (
          <Post key={post.postId} post={post} currentUserId={userData?.userId} />
        ))}
      </div>
    );
  };

  if (!userData) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page">
      <AppNavbar />
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <Image
              src={profile?.profileImageUrl ? `${AppConstants.getBaseUrl()}${profile.profileImageUrl}` : avatarFallback}
              alt="Profile"
              className="profile-avatar"
            />
          </div>
          <div className="profile-info-section">
            <div className="profile-username-section">
              <h1 className="profile-username">{profile?.username || userData.username}</h1>
              <div className="profile-actions">
                <Button variant="outline-secondary" size="sm" onClick={handleEditProfile} className="edit-profile-button">
                  <Edit size={16} className="me-1" />
                  Edit Profile
                </Button>
              </div>
            </div>
            <div className="profile-stats">
              <span className="stat">
                <strong>{profile?.postsCount || posts.length}</strong> posts
              </span>
              <span className="stat">
                <strong>{profile?.followersCount || 0}</strong> followers
              </span>
              <span className="stat">
                <strong>{profile?.followingCount || 0}</strong> following
              </span>
            </div>
            <div className="profile-fullname">{profile?.name || userData.name}</div>
            {profile?.bio && <div className="profile-bio">{profile.bio}</div>}
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid3X3 size={16} />
            Posts
          </button>
          <button 
            className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            <Heart size={16} />
            Liked
          </button>
          <button 
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={16} />
            Saved
          </button>
        </div>

        <div className="profile-content-area">
          <div className="posts-grid">
            {activeTab === 'posts' && renderPosts(posts)}
            {activeTab === 'liked' && renderPosts(likedPosts)}
            {activeTab === 'saved' && renderPosts(savedPosts)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
