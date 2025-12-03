import React from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="layout">
      
      <Sidebar />
      
      
      <div className="main-content">
        <Navbar />
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>

    
  );
}

export default Layout;