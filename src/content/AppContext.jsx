import {createContext, useState} from "react";
import {AppConstants} from "../util/constants.js";
import axios from "axios";
import {toast} from "react-toastify";
import { useEffect } from "react";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendURL = AppConstants.BACKEND_URL
    const[isLoggedIn, setIsLoggedIn] = useState(false);
    const[userData, setUserData] = useState(null);

    // const getUserData = async () => {
    //     try {
    //         const response = await axios.get(`${backendURL}/profile`);
    //         if (response.status === 200) {
    //             setUserData(response.data);
    //             setIsLoggedIn(true);
    //         } else {
    //             toast.error("Unable to get user data");
    //         }
    //     } catch (err) {
    //         console.log(err)
    //     }
    // };

    const getUserData = async () => {
        try {
            const res = await axios.get(`${backendURL}/profile`, { withCredentials: true });
            setUserData(res.data);
            setIsLoggedIn(true);
        } catch (err) {
            if (err.response?.status !== 401) {
                toast.error('Unable to fetch user data');
            }
        }
    };


    // useEffect(() => {
    //     axios.defaults.withCredentials = true;
    //     getUserData();
    // }, [])

    useEffect(() => {
        if (isLoggedIn) getUserData();
    }, [isLoggedIn]);



    const contextValue = {
        backendURL,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,


    }
    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    )
}