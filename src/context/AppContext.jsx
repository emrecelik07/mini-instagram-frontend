import {createContext, useMemo, useState} from "react";
import {AppConstants} from "../util/constants.js";
import axios from "axios";
import {toast} from "react-toastify";
import { useEffect } from "react";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendURL = AppConstants.BACKEND_URL
    const[isLoggedIn, setIsLoggedIn] = useState(false);
    const[userData, setUserData] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    //axios instance for the whole app
    const api = useMemo(() => {
        return axios.create({
            baseURL: backendURL,
            withCredentials: true, // always include cookies
        });
    }, [backendURL]);

    //Boot-time session check
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/profile");
                setIsLoggedIn(true);
                setUserData(data);
            } catch {
                setIsLoggedIn(false);
                setUserData(null);
            } finally {
                setAuthReady(true);
            }
        })();
    }, [api]);

    const getUserData = async () => {
        try {
            const { data } = await api.get("/profile");
            setUserData(data);
        } catch (err) {
            if (err.response?.status !== 401) toast.error("Unable to fetch user data");
        }
    };


    const contextValue = {
        backendURL,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
        authReady,


    }
    return (
        <AppContext.Provider
            value={{
                backendURL,
                api,
                isLoggedIn, setIsLoggedIn,
                userData, setUserData,
                getUserData,
                authReady,
            }}
        >
            {props.children}
        </AppContext.Provider>
    )
}