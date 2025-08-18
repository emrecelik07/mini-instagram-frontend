import { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card, Alert } from "react-bootstrap";
import { AppContext } from "../context/AppContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import { toast } from "react-toastify";

export default function SettingsPage() {
    const { userData, api, getUserData } = useContext(AppContext);
    
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        username: userData?.username || "",
        bio: userData?.bio || ""
    });

    // Update form data when userData changes
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                username: userData.username || "",
                bio: userData.bio || ""
            });
        }
    }, [userData]);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Only send the fields we want to update
            const updateData = {
                name: formData.name,
                username: formData.username,
                bio: formData.bio
            };
            
            const response = await api.put("/profile", updateData);
            
            if (response.status === 200) {
                toast.success("Profile updated successfully!");
                await getUserData(); // Refresh user data
                setMessage("Profile updated successfully!");
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.message || "Failed to update profile";
            toast.error(errorMsg);
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar />
            
            <Container className="py-4" style={{ maxWidth: 600 }}>
                <Row className="justify-content-center">
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white">
                                <h4 className="mb-0">Edit Profile</h4>
                            </Card.Header>
                            <Card.Body>
                                {message && (
                                    <Alert variant={message.includes("successfully") ? "success" : "danger"}>
                                        {message}
                                    </Alert>
                                )}
                                
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            placeholder="Enter username"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Bio</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button variant="outline-secondary" href="/profile">
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            disabled={loading}
                                        >
                                            {loading ? "Updating..." : "Update Profile"}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
