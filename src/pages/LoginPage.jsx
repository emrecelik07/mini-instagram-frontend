import React, {useContext, useState} from 'react';
import {AppContext} from "../content/AppContext.jsx";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import TermsModal from '../components/TermsModal';
import "../LoginPage.css";


function LoginPage() {
    const [activeTab, setActiveTab] = useState('login');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {backendURL, setIsLoggedIn, getUserData} = useContext(AppContext);
    const navigate = useNavigate();

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const openTermsModal = () => setShowTerms(true);
    const closeTermsModal = () => setShowTerms(false);
    const [rememberMe, setRememberMe] = useState(false);


    const onSubmitHandler = async (e) => {
        e.preventDefault();
        axios.defaults.withCredentials = true;
        setLoading(true);
        try {
            if(activeTab === 'signup') {
                //register api
                const response = await axios.post(`${backendURL}/register`, {name, email, password})
                if(response.status === 201){
                    navigate("/login")
                    toast.success("User registered successfully.");
                }else {
                    toast.error("Email already exists");
                }

            }else{
                const response = await axios.post(`${backendURL}/login`, {email, password, rememberMe})

                if (response.status === 200){
                    setIsLoggedIn(true)
                    getUserData();
                    navigate("/welcome")
                }else {
                    toast.error("Wrong email or password");
                }
            }
        }catch(err){
            toast.error(err?.response?.data?.message || "Something went wrong");
        }finally{
            setLoading(false);}
    }

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    // forgot password
    const handleForgotPassword = (e) => {
        e.preventDefault();
        localStorage.setItem('resetFlow', 'started');
        navigate('/reset-password');
    };

    return (

        <div className="login-page">
            <div className={"overlay"}/>

            <div className="login-card">
                <div className="container p-3 my-5 d-flex flex-column align-items-center">
                    {/* Tabs */}
                    <ul className="nav nav-pills mb-3 w-100 justify-content-between" id="pills-tab" role="tablist">
                        <li className="nav-item flex-fill text-center" role="presentation">
                            <button
                                className={`nav-link w-100 ${activeTab === 'login' ? 'active' : ''}`}
                                id="pills-login-tab"
                                type="button"
                                onClick={() => handleTabClick('login')}
                            >
                                Login
                            </button>
                        </li>
                        <li className="nav-item flex-fill text-center" role="presentation">
                            <button
                                className={`nav-link w-100 ${activeTab === 'signup' ? 'active' : ''}`}
                                id="pills-signup-tab"
                                type="button"
                                onClick={() => handleTabClick('signup')}
                            >
                                Sign up
                            </button>
                        </li>
                    </ul>

                    {/* Content */}
                    <div className="tab-content w-100">
                        {activeTab === 'login' && (
                            <div className="tab-pane fade show active" id="pills-login" role="tabpanel">
                                <form onSubmit={onSubmitHandler}>
                                    <div className="mb-4">
                                        <label htmlFor="loginEmail" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="loginEmail"
                                            className="form-control"
                                            placeholder="email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="loginPassword" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="loginPassword"
                                            className="form-control"
                                            placeholder="********"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between mb-4">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="loginRemember"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="loginRemember">
                                                Remember me
                                            </label>
                                        </div>
                                        <a
                                            href="#"
                                            className="link-secondary text-decoration-none"
                                            onClick={handleForgotPassword}
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 mb-4" >
                                        Sign in
                                    </button>

                                    <p className="text-center">
                                        Not a member?{' '}
                                        <a
                                            href="#"
                                            className="link-primary text-decoration-none"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTabClick('signup');
                                            }}
                                        >
                                            Sign up
                                        </a>
                                    </p>
                                </form>
                            </div>
                        )}

                        {activeTab === 'signup' && (
                            <div className="tab-pane fade show active" id="pills-signup" role="tabpanel">
                                <form onSubmit={onSubmitHandler}>
                                    <div className="mb-4">
                                        <label htmlFor="signupName" className="form-label">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="signupName"
                                            className="form-control"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="signupEmail" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="signupEmail"
                                            className="form-control"
                                            placeholder="email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="signupPassword" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="signupPassword"
                                            className="form-control"
                                            placeholder="********"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-check d-flex justify-content-center mb-4">
                                        <input
                                            className="form-check-input me-2"
                                            type="checkbox"
                                            id="signupTerms"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="signupTerms">
                                            I agree to the <a href="#" onClick={openTermsModal}>terms & conditions</a>
                                        </label>
                                        {showTerms && <TermsModal onClose={closeTermsModal} />}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-success w-100 mb-4"
                                        disabled={!acceptedTerms || loading}
                                    >
                                        Create account
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>


    );
}

export default LoginPage;
