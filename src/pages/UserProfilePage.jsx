import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Image, Card } from "react-bootstrap";
import { AppContext } from "../context/AppContext.jsx";
import avatarFallback from "../assets/img/avatarfallback.png";
import AppNavbar from "../components/AppNavbar.jsx";

export default function UserProfilePage() {
    const { username } = useParams();
    const { api, userData } = useContext(AppContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                // Search for the user by username
                const response = await api.get(`/search?q=${username}`);
                const users = response.data;
                
                // Find the exact match for username
                const user = users.find(u => u.username === username);
                
                if (user) {
                    setProfileData(user);
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
                                `http://localhost:8080${profileData.profileImageUrl}` : 
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
                                <Button as={Link} to="/settings" variant="outline-primary" size="sm">
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button variant="outline-primary" size="sm">
                                    Follow
                                </Button>
                            )}
                        </div>
                        <div className="d-flex gap-4 mt-3">
                            <span><strong>{profileData.postsCount ?? 0}</strong> posts</span>
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

                {/* Posts grid placeholder */}
                <Row className="g-3">
                    {Array.from({ length: profileData.postsCount ?? 0 }).map((_, i) => (
                        <Col key={i} xs={4}>
                            <Card className="border-0">
                                <div style={{ position: "relative", paddingBottom: "100%", background: "#f1f3f5" }}>
                                    <div style={{
                                        position: "absolute", inset: 0, display: "grid", placeItems: "center",
                                        fontSize: 12, color: "#868e96"
                                    }}>
                                        Post #{i + 1}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                    {(!profileData.postsCount || profileData.postsCount === 0) && (
                        <Col xs={12} className="text-center py-5">
                            <p className="text-muted">No posts yet</p>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
}
