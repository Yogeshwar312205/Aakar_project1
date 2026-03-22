// src/components/LogoutButton.jsx

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {logout} from '../features/authSlice.js';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from "axios";
import {CiLogout} from "react-icons/ci";
import {clearDepartment} from "../features/departmentSlice";

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        dispatch(logout());
        dispatch(clearDepartment());
    };


    return (
            <div onClick={handleLogout} className={`icon-container mb-2`}>
                <CiLogout size={22} color="white"/>
                <span className="menu-text">Logout</span>
            </div>
    );
};

export default LogoutButton;
