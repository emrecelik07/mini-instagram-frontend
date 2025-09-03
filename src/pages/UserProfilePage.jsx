import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Image, Card } from "react-bootstrap";
import { AppContext } from "../context/AppContext.jsx";
import { AppConstants } from "../util/constants.js";
import avatarFallback from "../assets/img/avatarfallback.png";
import AppNavbar from "../components/AppNavbar.jsx";
import CreatePost from "../components/CreatePost.jsx";
import Post from "../components/Post.jsx";
import { Plus } from "lucide-react";

export default function UserProfilePage() {
    const { username } = useParams();
    const { api, userData } = useContext(AppContext);
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
        
                const response = await api.get(`/search?q=${username}`);
                const users = response.data;
                
                const user = users.find(u => u.username === username);
                
                if (user) {
                    setProfileData(user);
                    await fetchUserPosts(user.userId);
                    await checkFollowStatus(user.userId);
                } else {
                    setError("User not found");
                }
            } catch (err) {
                setError("Failed to load user profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserProfile();
        }
    }, [username, api]);

    const fetchUserPosts = async (userId) => {
        try {
            const response = await api.get(`/posts/user/${userId}`);
            setPosts(response.data);
        } catch (err) {
            console.error("Failed to fetch user posts:", err);
            setPosts([]);
        }
    };

    const checkFollowStatus = async (userId) => {
        if (!userData || userData.userId === userId) return;
        
        try {
            const response = await api.get(`/follows/check/${userId}`);
            setIsFollowing(response.data);
        } catch (err) {
            console.error("Failed to check follow status:", err);
        }
    };

    const handleFollow = async () => {
        if (!profileData || !userData || userData.userId === profileData.userId) return;
        
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.post('/follows/unfollow', { followingUserId: profileData.userId });
                setIsFollowing(false);
                setProfileData(prev => ({
                    ...prev,
                    followersCount: (prev.followersCount || 0) - 1
                }));
            } else {
                await api.post('/follows/follow', { followingUserId: profileData.userId });
                setIsFollowing(true);
                setProfileData(prev => ({
                    ...prev,
                    followersCount: (prev.followersCount || 0) + 1
                }));
            }
        } catch (err) {
            console.error("Failed to follow/unfollow user:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handlePostCreated = async (newPost) => {
        // Refresh the posts list
        if (profileData) {
            await fetchUserPosts(profileData.userId);
        }
        // Update the posts count in profile data
        setProfileData(prev => ({
            ...prev,
            postsCount: (prev.postsCount || 0) + 1
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center min-vh-100 justify-content-center">
                <AppNavbar />
                <Container className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center min-vh-100 justify-content-center">
                <AppNavbar />
                <Container className="text-center py-5">
                    <h3>User Not Found</h3>
                    <p className="text-muted">{error}</p>
                    <Button as={Link} to="/" variant="primary">
                        Go Home
                    </Button>
                </Container>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    const isOwnProfile = userData?.username === username;

    return (
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar />

            <Container className="flex flex-col items-center min-vh-100 justify-content-center py-4" style={{ maxWidth: 960 }}>
                {/* Header */}
                <Row className="align-items-center mb-4">
                    <Col xs="auto" className="text-center">
                        <Image
                            src={profileData.profileImageUrl && profileData.profileImageUrl.trim() !== "" ? 
                                `${AppConstants.getBaseUrl()}${profileData.profileImageUrl}` : 
                                avatarFallback}
                            alt="avatar"
                            roundedCircle
                            style={{ width: 140, height: 140, objectFit: "cover", border: "1px solid #ddd" }}
                        />
                    </Col>

                    <Col>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <h3 className="m-0">{profileData.username}</h3>
                            {isOwnProfile ? (
                                <div className="d-flex gap-2">
                                    <Button as={Link} to="/settings" variant="outline-primary" size="sm">
                                        Edit Profile
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => setShowCreatePost(true)}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        New Post
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    variant={isFollowing ? "outline-secondary" : "primary"}
                                    size="sm"
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? (
                                        <div className="spinner-border spinner-border-sm me-1" />
                                    ) : null}
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                        <div className="d-flex gap-4 mt-3">
                            <span><strong>{posts.length}</strong> posts</span>
                            <span><strong>{profileData.followersCount ?? 0}</strong> followers</span>
                            <span><strong>{profileData.followingCount ?? 0}</strong> following</span>
                        </div>
                        <div className="mt-2">
                            <strong>{profileData.name}</strong>
                        </div>
                        <div className="mt-2 text-muted">
                            {profileData.bio || "No bio available"}
                        </div>
                    </Col>
                </Row>

                {/* Posts Section */}
                {posts.length > 0 ? (
                    <div className="w-100">
                        {posts.map((post) => (
                            <div key={post.postId} className="mb-4">
                                <Post 
                                    post={post}
                                    currentUserId={userData?.userId}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted">No posts yet</p>
                        {isOwnProfile && (
                            <Button 
                                variant="primary"
                                onClick={() => setShowCreatePost(true)}
                                className="d-flex align-items-center gap-2 mx-auto"
                            >
                                <Plus size={16} />
                                Create Your First Post
                            </Button>
                        )}
                    </div>
                )}
            </Container>

            {/* Create Post Modal */}
            {showCreatePost && (
                <CreatePost 
                    onPostCreated={handlePostCreated}
                    onClose={() => setShowCreatePost(false)}
                />
            )}
        </div>
    );
}
