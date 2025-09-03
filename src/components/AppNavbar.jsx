import React, { useContext } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Home, MessageCircle, Compass, Plus, Heart } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { AppConstants } from "../util/constants.js";
import { assets } from "../assets/assets.js";
import avatarFallback from "../assets/img/avatarfallback.png";
import SearchBar from "./SearchBar.jsx";
import { toast } from "react-toastify";

export default function AppNavbar() {
    const navigate = useNavigate();
    const {
        userData,
        setUserData,
        setIsLoggedIn,
        api,
    } = useContext(AppContext);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            setIsLoggedIn(false);
            setUserData(null);
            navigate("/");
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    return (
        <Navbar bg="white" expand="md" className="border-bottom shadow-sm pb-0">
            <Container>
                {/* logo */}
                <Navbar.Brand as={Link} to="/" className="p-0">
                    <img src={assets.logo} alt="logo" height={32} />
                </Navbar.Brand>

                {userData ? (
                    <>
                        {/* search */}
                        <SearchBar />

                        <Navbar.Toggle aria-controls="main-nav" />

                        {/* icons + avatar */}
                        <Navbar.Collapse
                            id="main-nav"
                            className="justify-content-end align-items-center"
                        >
                            <Nav className="gap-3">
                                <Nav.Link as={Link} to="/">
                                    <Home size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/messages">
                                    <MessageCircle size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/explore">
                                    <Compass size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/create">
                                    <Plus size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/notifications">
                                    <Heart size={20} />
                                </Nav.Link>

                                <NavDropdown
                                    align="end"
                                    id="profile-menu"
                                    title={
                                        <img
                                            src={userData?.profileImageUrl && userData.profileImageUrl.trim() !== "" ? 
                                                `${AppConstants.getBaseUrl()}${userData.profileImageUrl}` : 
                                                avatarFallback}
                                            alt="Profile"
                                            width={24}
                                            height={24}
                                            className="rounded-circle"
                                            style={{ objectFit: "cover" }}
                                        />
                                    }
                                >
                                    <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/saved">Saved</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        Log out
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </>
                ) : (
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    </Nav>
                )}
            </Container>
        </Navbar>
    );
}
