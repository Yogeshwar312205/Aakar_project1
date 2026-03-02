import React from 'react'
import logo from '../../assets/aakarlogo.svg'
import './Navbar.css'
import { FiUser } from "react-icons/fi";


const Navbar = () => {
  return (
    <nav id="navbar">
      <img src={logo} alt="Aakar Dies & Moulds" />
      <FiUser className='user-icon' color='white' size={20}/>      
    </nav>
  )
}

export default Navbar
