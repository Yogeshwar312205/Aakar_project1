import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice.js'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiLock } from 'react-icons/fi'
import logo from '../assets/logo.png'
import './NavBar.css'

const NavBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dropdownRef = useRef(null)
  const avatarRef = useRef(null)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const toggleDropdown = () => {
    console.log('🔵 Profile icon clicked, current state:', dropdownOpen)
    setDropdownOpen(!dropdownOpen)
    console.log('🔵 Dropdown should now be:', !dropdownOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    isAuthenticated && (
      <nav className="modern-navbar">
        <div className="navbar-left">
          <img src={logo} alt="Aakar Dies & Moulds" className="navbar-logo" />
          <div className="navbar-title">
            <h2>Aakar ERP</h2>
            <span className="navbar-subtitle">Enterprise Resource Planning</span>
          </div>
        </div>

        <div className="navbar-right">
          {/* User Profile Dropdown */}
          <div className="navbar-user-section" ref={avatarRef}>
            <div className="navbar-user-info" onClick={toggleDropdown}>
              <div className="navbar-avatar">
                <FiUser size={18} />
              </div>
              <div className="navbar-user-details">
                <span className="navbar-username">{user?.employeeName || 'User'}</span>
                <span className="navbar-userrole">
                  {user?.customEmployeeId ? `ID: ${user.customEmployeeId}` : 'Employee'}
                </span>
              </div>
            </div>

            {dropdownOpen && (
              <div ref={dropdownRef} className="modern-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <FiUser size={24} />
                  </div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-username">{user?.employeeName}</p>
                    <p className="dropdown-email">{user?.employeeEmail}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setDropdownOpen(false)
                  }}
                  className="dropdown-item"
                >
                  <FiUser size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setDropdownOpen(false)
                  }}
                  className="dropdown-item"
                >
                  <FiLock size={16} />
                  <span>Change Password</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    handleLogout()
                    setDropdownOpen(false)
                  }}
                  className="dropdown-item logout"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    )
  )
}

export default NavBar
