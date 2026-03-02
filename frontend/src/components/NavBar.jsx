import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice.js'
import { useNavigate } from 'react-router-dom'
import { FiAlignLeft, FiLogOut, FiUser } from 'react-icons/fi'
import logo from '../assets/logo.svg'
import './NavBar.css'

const NavBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth) // Access the login status from Redux
  const dropdownRef = useRef(null)
  const avatarRef = useRef(null)
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    isAuthenticated && (
      <>
        <nav id="navbar">
          <img src={logo} alt="Aakar Dies & Moulds" />
          <div className="navDiv">
            {isAuthenticated ? (
              <div className="user-icon-container" ref={avatarRef}>
                <FiUser
                  className="user-icon"
                  color="white"
                  size={18}
                  onClick={toggleDropdown}
                />
                {/*<img*/}
                {/*    src={logo || "https://via.placeholder.com/45"}*/}
                {/*    alt="User Avatar"*/}
                {/*    className="rounded-full w-[45px] h-[45px] cursor-pointer"*/}
                {/*    onClick={toggleDropdown}*/}
                {/*/>*/}
                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="dropdown-menu bg-white shadow-md rounded-md p-2"
                  >
                    <button
                      onClick={() => navigate('/profile')}
                      className={`flex items-center justify-start gap-3`}
                    >
                      <FiUser className={`ml-3`} /> My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center justify-start gap-3`}
                    >
                      <FiLogOut className={`ml-3`} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="login-btn uppercase flex font-semibold"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </>
    )
  )
}

export default NavBar
