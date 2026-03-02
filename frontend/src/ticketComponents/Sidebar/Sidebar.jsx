import "./Sidebar.css";
import { FiMenu, FiClipboard, FiBriefcase, FiUser } from "react-icons/fi";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <FiMenu className="menu-icon" size={24} color="white" />
      <div className="menu">
        <div className="icon-container">
          <FiClipboard className="icon" size={24} color="white" />
          <span className="menu-text">Projects</span>
        </div>
        <div className="icon-container">
          <FiBriefcase className="icon" size={24} color="white" />
          <span className="menu-text">Departments</span>
        </div>
        <div className="icon-container">
          <FiUser className="icon" size={24} color="white" />
          <span className="menu-text">Employees</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;