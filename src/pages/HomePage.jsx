import React, { useState, useEffect, useContext } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import AppNavbar from "../components/AppNavbar.jsx";
import Post from "../components/Post.jsx";
import CreatePost from "../components/CreatePost.jsx";
import { AppContext } from "../context/AppContext.jsx";
import "./HomePage.css";

function HomePage() {
    const { api, userData } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);

    useEffect(() => {
        fetchFeed();
    }, [api]);

    const fetchFeed = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/posts/feed');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handlePostDeleted = (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.postId !== deletedPostId));
    };

    if (isLoading) {
        return (
            <div className="home-page">
                <AppNavbar />
                <div className="loading-container">
                    <Loader2 size={32} className="spinner" />
                    <p>Loading your feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <AppNavbar />
            
            <div className="home-content">
                <div className="feed-container">
                    <div className="feed-header">
                        <h1>Feed</h1>
                        <button 
                            className="create-post-button"
                            onClick={() => setShowCreatePost(true)}
                        >
                            <Plus size={20} />
                            New Post
                        </button>
                    </div>

                    {posts.length === 0 ? (
                        <div className="empty-feed">
                            <div className="empty-feed-content">
                                <h2>Welcome to Ministagram!</h2>
                                <p>Follow some users to see their posts here, or create your first post to get started.</p>
                                <button 
                                    className="create-first-post-button"
                                    onClick={() => setShowCreatePost(true)}
                                >
                                    <Plus size={20} />
                                    Create Your First Post
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="posts-container">
                            {posts.map(post => (
                                <Post
                                    key={post.postId}
                                    post={post}
                                    currentUserId={userData?.userId}
                                    onPostDeleted={handlePostDeleted}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showCreatePost && (
                <CreatePost
                    onPostCreated={handlePostCreated}
                    onClose={() => setShowCreatePost(false)}
                />
            )}
        </div>
    );
}

export default HomePage;