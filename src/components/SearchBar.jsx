import { useContext, useState, useEffect, useRef } from "react";
import { Form, FormControl, Dropdown, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import avatarFallback from "../assets/img/avatarfallback.png";

export default function SearchBar() {
    const { api } = useContext(AppContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/search?q=${searchTerm.trim()}`);
                setSearchResults(response.data);
                setShowDropdown(response.data.length > 0);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
                setShowDropdown(false);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, api]);

    const handleUserClick = (username) => {
        setSearchTerm("");
        setShowDropdown(false);
        navigate(`/user/${username}`);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div ref={searchRef} className="position-relative">
            <Form className="d-none d-md-flex mx-auto" role="search">
                <FormControl
                    type="search"
                    placeholder="Search users..."
                    aria-label="Search"
                    size="sm"
                    className="bg-light border-0 px-2"
                    style={{ width: 250 }}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => searchTerm.trim().length >= 2 && setShowDropdown(true)}
                />
            </Form>

            {showDropdown && (
                <Dropdown.Menu 
                    show={showDropdown} 
                    className="position-absolute w-100 mt-1 shadow"
                    style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}
                >
                    {loading ? (
                        <Dropdown.Item disabled>
                            <div className="text-center py-2">
                                <div className="spinner-border spinner-border-sm me-2" />
                                Searching...
                            </div>
                        </Dropdown.Item>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <Dropdown.Item
                                key={user.userId}
                                onClick={() => handleUserClick(user.username)}
                                className="d-flex align-items-center py-2"
                            >
                                <Image
                                    src={user.profileImageUrl && user.profileImageUrl.trim() !== "" ? 
                                        `http://localhost:8080${user.profileImageUrl}` : 
                                        avatarFallback}
                                    alt={user.username}
                                    roundedCircle
                                    width={32}
                                    height={32}
                                    className="me-2"
                                    style={{ objectFit: "cover" }}
                                />
                                <div>
                                    <div className="fw-semibold">{user.username}</div>
                                    <div className="text-muted small">{user.name}</div>
                                </div>
                            </Dropdown.Item>
                        ))
                    ) : searchTerm.trim().length >= 2 ? (
                        <Dropdown.Item disabled>
                            <div className="text-center py-2 text-muted">
                                No users found
                            </div>
                        </Dropdown.Item>
                    ) : null}
                </Dropdown.Menu>
            )}
        </div>
    );
}
