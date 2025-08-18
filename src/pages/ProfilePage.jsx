// src/pages/ProfilePage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Modal, Image, Card } from "react-bootstrap";
import { AppContext } from "../context/AppContext.jsx";
import avatarFallback from "../assets/img/avatarfallback.png";
import AppNavbar from "../components/AppNavbar.jsx";


export default function ProfilePage() {
    const { userData, api, getUserData,setUserData } = useContext(AppContext);

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [imgVersion, setImgVersion] = useState(0);

    const avatarSrc = useMemo(() => {
        const base = preview || userData?.profileImageUrl || avatarFallback;
        if (!base) return avatarFallback;
        if (typeof base === "string" && base.startsWith("blob:")) return base; // don't touch blobs
        if (typeof base === "string" && base.startsWith("/api/v1.0")) {
            // Convert backend URL to frontend URL
            const backendUrl = "http://localhost:8080";
            return `${backendUrl}${base}${base.includes("?") ? "&" : "?"}v=${imgVersion}`;
        }
        return `${base}${base.includes("?") ? "&" : "?"}v=${imgVersion}`;
    }, [preview, userData?.profileImageUrl, imgVersion]);


    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const onFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const okTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!okTypes.includes(f.type)) {
            alert("Please choose a JPG, PNG, or WebP image.");
            return;
        }
        const MAX_MB = 5;
        if (f.size > MAX_MB * 1024 * 1024) {
            alert(`Max file size is ${MAX_MB}MB.`);
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const uploadAvatar = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);

            const { data } = await api.post("/users/me/avatar", fd); // returns ProfileResponse

            // update UI immediately from response, then also re-pull to stay consistent
            if (data?.profileImageUrl) setUserData((prev) => ({ ...(prev || {}), ...data }));
            await getUserData();

            setPreview("");
            setImgVersion((v) => v + 1);
            setShowAvatarModal(false);
            setFile(null);
        } catch (err) {
            alert(err?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar/>

            <Container className="flex flex-col items-center min-vh-100 justify-content-center py-4" style={{ maxWidth: 960 }}>
                {/* Header */}
                <Row className="align-items-center mb-4">
                    <Col xs="auto" className="text-center">
                        <Image
                            src={avatarSrc}
                            alt="avatar"
                            roundedCircle
                            style={{ width: 140, height: 140, objectFit: "cover", border: "1px solid #ddd" }}
                            onClick={() => setShowAvatarModal(true)}
                            role="button"
                            title="Change photo"
                        />
                        <div className="mt-2">
                            <Button variant="outline-secondary" size="sm" onClick={() => setShowAvatarModal(true)}>
                                Change Photo
                            </Button>
                        </div>
                    </Col>

                    <Col>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <h3 className="m-0">{userData?.username || "username"}</h3>
                            <Button as={Link} to="/settings" variant="outline-primary" size="sm">
                                Edit Profile
                            </Button>
                        </div>
                        <div className="d-flex gap-4 mt-3">
                            <span><strong>{userData?.postsCount ?? 0}</strong> posts</span>
                            <span><strong>{userData?.followersCount ?? 0}</strong> followers</span>
                            <span><strong>{userData?.followingCount ?? 0}</strong> following</span>
                        </div>
                        <div className="mt-2">
                            <strong>{userData?.name}</strong>
                        </div>
                        <div className="mt-2 text-muted">
                            {userData?.bio || "Tell the world about yourself…"}
                        </div>
                    </Col>
                </Row>

                {/* Posts grid placeholder */}
                <Row className="g-3">
                    {Array.from({ length: userData?.postsCount ?? 9 }).map((_, i) => (
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
                </Row>

                {/* Avatar Uploader Modal */}
                <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Update profile photo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex flex-column align-items-center">
                            <Image
                                src={preview || avatarSrc}
                                alt="preview"
                                roundedCircle
                                style={{ width: 160, height: 160, objectFit: "cover", border: "1px solid #ddd" }}
                                className="mb-3"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={onFileSelect}
                            />
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    Choose Image
                                </Button>
                                <Button variant="primary" onClick={uploadAvatar} disabled={!file || uploading}>
                                    {uploading ? "Uploading…" : "Upload"}
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>


    );
}
