// App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useContext } from "react";

import { AppContextProvider, AppContext } from "./content/AppContext.jsx"; // assumes ctx exposes isLoggedIn
import HomePage    from "./pages/HomePage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage   from "./pages/LoginPage.jsx";

function PrivateRoute({ children }) {
    const { isLoggedIn } = useContext(AppContext);
    const location = useLocation();

    return isLoggedIn
        ? children
        : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
    return (
        <AppContextProvider>
            <ToastContainer />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

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
                </Routes>
        </AppContextProvider>
    );
}
