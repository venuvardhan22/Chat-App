import React from 'react'
import { Navigate } from "react-router-dom";

export const ProtectHome = ({children}) => {

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        return <Navigate to="/" replace />;
    }   
    return children;
}

export const ProtectLogin = ({children}) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        return <Navigate to="/home" replace />;
    }
    return children;
}

export const ProtectSignin = ({children}) => {
    const user = JSON.parse(localStorage.getItem("user"))
    if(user) {
        return <Navigate to="/home" replace />;
    }
    return children;
}