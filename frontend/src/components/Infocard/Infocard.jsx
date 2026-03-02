import React from 'react'
import './Infocard.css'
import {
  FiClipboard,
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi'
import { TbSubtask } from 'react-icons/tb'

const Infocard = ({ icon, number, text, className, width }) => {
  return (
    <div className={`infocard ${className}`} style={{ width: `${width}px` }}>
      {icon === `<FiClipboard />` && <FiClipboard size={40} fontWeight={300} />}
      {icon === `<TbSubtask />` && <TbSubtask size={40} fontWeight={300} />}
      {icon === `<FiBell />` && <FiBell size={40} fontWeight={300} />}
      {icon === `<FiAlertCircle />` && (
        <FiAlertCircle size={40} fontWeight={300} />
      )}
      {icon === `<FiCheckCircle />` && (
        <FiCheckCircle size={40} fontWeight={300} />
      )}
      {icon === `<FiUser />` && <FiUser size={40} fontWeight={300} />}
      {icon === `<FiBriefcase />` && <FiBriefcase size={40} fontWeight={300} />}
      <div className="info">
        <div className="info-number">{number}</div>
        <div className="info-text">{text}</div>
      </div>
    </div>
  )
}

export default Infocard
