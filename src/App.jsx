import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useContext } from "react";

import { AppContextProvider, AppContext } from "./context/AppContext.jsx"; // assumes ctx exposes isLoggedIn
import HomePage    from "./pages/HomePage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage   from "./pages/LoginPage.jsx";
import ResetPasswordOtpPage from "./pages/ResetPasswordOtpPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import FollowersPage from "./pages/FollowersPage.jsx";

function PrivateRoute({ children }) {
    const { isLoggedIn, authReady  } = useContext(AppContext);
    const location = useLocation();

    if (!authReady) return null;

    return isLoggedIn
        ? children
        : <Navigate to="/login" replace state={{ from: location }} />;
}

function PublicRoute({ children }) {
    const { isLoggedIn} = useContext(AppContext);
    return !isLoggedIn
        ? children
        : <Navigate to="/" replace/>;
}


export default function App() {
    return (
        <AppContextProvider>
            <ToastContainer />
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <LoginPage/>
                        </PublicRoute>
                    } />

                    <Route
                        path="/reset-password"
                        element={
                            <PublicRoute>
                                <ResetPasswordOtpPage/>
                            </PublicRoute>
                        }
                    />

                    {/* everything below requires auth */}

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/welcome"
                        element={
                            <PrivateRoute>
                                <WelcomePage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user/:username"
                        element={
                            <PrivateRoute>
                                <UserProfilePage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/user/:username/followers"
                        element={
                            <PrivateRoute>
                                <FollowersPage />
                            </PrivateRoute>
                        }
                    />

                </Routes>
        </AppContextProvider>
    );
}
