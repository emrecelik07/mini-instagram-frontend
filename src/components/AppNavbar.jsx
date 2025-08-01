import {
    Navbar,
    Container,
    Nav,
    Form,
    FormControl,
    NavDropdown,
    Button          // add Button
} from "react-bootstrap";
import { Chat, Compass, PlusSquare, Heart } from "react-bootstrap-icons";
import { assets } from "../assets/assets.js";
import { useContext } from "react";
import { AppContext } from "../content/AppContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AppNavbar() {
    const navigate = useNavigate();
    const {
        userData,
        backendURL,
        setUserData,
        setIsLoggedIn
    } = useContext(AppContext);

    const handleLogout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendURL}/logout`);
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
                <Navbar.Brand href="/" className="p-0">
                    <img src={assets.logo} alt="logo" height={32} />
                </Navbar.Brand>



                {userData ? (
                    <>
                        {/* search */}
                        <Form className="d-none d-md-flex mx-auto" role="search">
                            <FormControl
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                size="sm"
                                className="bg-light border-0 px-2"
                                style={{ width: 250 }}
                            />
                        </Form>

                        {/* burger on mobile */}
                        <Navbar.Toggle aria-controls="main-nav" />

                        {/* icons + avatar */}
                        <Navbar.Collapse
                            id="main-nav"
                            className="justify-content-end align-items-center"
                        >
                            <Nav className="gap-3">
                                <Nav.Link href="/messages">
                                    <Chat size={20} />
                                </Nav.Link>
                                <Nav.Link href="/explore">
                                    <Compass size={20} />
                                </Nav.Link>
                                <Nav.Link href="/create">
                                    <PlusSquare size={20} />
                                </Nav.Link>
                                <Nav.Link href="/notifications">
                                    <Heart size={20} />
                                </Nav.Link>

                                <NavDropdown
                                    align="end"
                                    id="profile-menu"
                                    title={
                                        <img
                                            src="/avatar.jpg"
                                            alt="Profile"
                                            width={24}
                                            height={24}
                                            className="rounded-circle"
                                        />
                                    }
                                >
                                    <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                                    <NavDropdown.Item href="/saved">Saved</NavDropdown.Item>
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
