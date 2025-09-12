import { useContext, useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Form, Card, Alert, Image, Modal } from "react-bootstrap";
import { AppContext } from "../context/AppContext.jsx";
import { AppConstants } from "../util/constants.js";
import AppNavbar from "../components/AppNavbar.jsx";
import { toast } from "react-toastify";
import { Camera, Loader2 } from "lucide-react";
import avatarFallback from "../assets/img/avatarfallback.png";

export default function SettingsPage() {
    const { userData, api, getUserData } = useContext(AppContext);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        username: userData?.username || "",
        bio: userData?.bio || ""
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarLoading, setAvatarLoading] = useState(false);

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetPwd, setShowResetPwd] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [resetNewPwd, setResetNewPwd] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setAvatarPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            toast.error("Please select an image first");
            return;
        }

        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', avatarFile);
            
            const response = await api.post('/users/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                toast.success("Avatar updated successfully!");
                await getUserData(); // Refresh user data
                setAvatarFile(null);
                setAvatarPreview("");
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.message || "Failed to upload avatar";
            toast.error(errorMsg);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            
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

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete('/profile');
            toast.success('Your account has been deleted');
            // best-effort logout/reset and redirect
            try { await api.post('/logout'); } catch {}
            window.location.href = '/login';
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Failed to delete account';
            toast.error(errorMsg);
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetEmail || !resetNewPwd) return toast.error('Fill all fields');
        setResetLoading(true);
        try {
            await api.post('/change-password', { currentPassword: resetEmail, newPassword: resetNewPwd });
            // Note: resetEmail is repurposed input for current password in this modal
            toast.success('Password updated');
            setShowResetPwd(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar />
            
            <Container className="py-4" style={{ maxWidth: 600 }}>
                <Row className="justify-content-center">
                    <Col>
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="bg-white">
                                <h4 className="mb-0">Change Avatar</h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="text-center mb-3">
                                    <div className="position-relative d-inline-block">
                                        <Image
                                            src={avatarPreview || (userData?.profileImageUrl && userData.profileImageUrl.trim() !== "" ? 
                                                `${AppConstants.getBaseUrl()}${userData.profileImageUrl}` : 
                                                avatarFallback)}
                                            alt="Avatar"
                                            roundedCircle
                                            style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid #ddd" }}
                                        />
                                        <button
                                            className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle"
                                            style={{ width: 32, height: 32 }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                    style={{ display: 'none' }}
                                />
                                
                                <div className="text-center">
                                    {avatarFile ? (
                                        <>
                                            <Button 
                                                variant="primary" 
                                                onClick={handleAvatarUpload}
                                                disabled={avatarLoading}
                                                className="me-2"
                                            >
                                                {avatarLoading ? (
                                                    <>
                                                        <Loader2 size={16} className="spinner me-1" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    "Upload Avatar"
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => {
                                                    setAvatarFile(null);
                                                    setAvatarPreview("");
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        userData?.profileImageUrl ? (
                                            <Button 
                                                variant="outline-danger"
                                                onClick={async () => {
                                                    try {
                                                        setAvatarLoading(true);
                                                        await api.delete('/users/me/avatar');
                                                        await getUserData();
                                                        toast.success('Profile photo removed');
                                                    } catch (err) {
                                                        toast.error('Unable to remove photo');
                                                    } finally {
                                                        setAvatarLoading(false);
                                                    }
                                                }}
                                            >
                                                Remove Photo
                                            </Button>
                                        ) : null
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

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

                        <Card className="shadow-sm mt-4">
                            <Card.Header className="bg-white">
                                <h4 className="mb-0 text-danger">Danger Zone</h4>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted mb-3">Delete your account and all associated data. This action cannot be undone.</p>
                                <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                                    Delete Account
                                </Button>
                                <Button variant="outline-secondary" className="ms-2" onClick={() => setShowResetPwd(true)}>
                                    Reset Password
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete account?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    This will permanently remove your account and data. This cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showResetPwd} onHide={() => setShowResetPwd(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <Form.Label>Current password</Form.Label>
                        <Form.Control type="password" value={resetEmail} onChange={(e)=>setResetEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <Form.Label>New password</Form.Label>
                        <Form.Control type="password" value={resetNewPwd} onChange={(e)=>setResetNewPwd(e.target.value)} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=>setShowResetPwd(false)} disabled={resetLoading}>Cancel</Button>
                    <Button variant="primary" onClick={handleResetPassword} disabled={resetLoading}>Update Password</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
