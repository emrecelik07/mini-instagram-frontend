import {
    Navbar,
    Container,
    Nav,
    NavDropdown,
    Button
} from "react-bootstrap";
import { Chat, Compass, PlusSquare, Heart } from "react-bootstrap-icons";
import { assets } from "../assets/assets.js";
import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar.jsx";
import avatarFallback from "../assets/img/avatarfallback.png";

function AppNavbar() {
    const navigate = useNavigate();
    const {
        userData,
        setUserData,
        setIsLoggedIn,
        api,
    } = useContext(AppContext);

    const handleLogout = async () => {
        try {
            const res = await api.post("/logout");
            if (res.status === 200) {
                setIsLoggedIn(false);
                setUserData(null);
                navigate("/");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Logout failed");
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
                                <Nav.Link as={Link} to="/messages">
                                    <Chat size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/explore">
                                    <Compass size={20} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/create">
                                    <PlusSquare size={20} />
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
                                                `http://localhost:8080${userData.profileImageUrl}` : 
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
                    <Button
                        variant="outline-dark"
                        className="rounded-pill px-3 ms-auto"
                        onClick={() => navigate("/login")}
                    >
                        Login <i className="bi bi-arrow-right ms-2" />
                    </Button>
                )}
            </Container>
        </Navbar>
    );
}

export default AppNavbar;
