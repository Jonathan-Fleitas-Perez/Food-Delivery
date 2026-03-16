import React from 'react'
import { TbHomeFilled } from 'react-icons/tb'
import {Link , NavLink} from 'react-router-dom'
import {FaRegWindowClose} from 'react-icons/fa'
import {IoMdListBox} from 'react-icons/io'
import {IoMailOpen} from 'react-icons/io5'

const Navbar = ({ containerStyles, setMenuOpened }) => {
  const navItems = [
    { to: "/", label: "Inicio", icon: <TbHomeFilled /> },
    { to: "/menu", label: "Menú", icon: <IoMdListBox /> },
    { to: "/about", label: "Sobre Nosotros", icon: <IoMailOpen /> },
  ]

  return (
    <nav className={containerStyles}>
      {navItems.map(({ to, label, icon }) => (
        <NavLink 
          key={label}
          to={to} 
          onClick={() => setMenuOpened && setMenuOpened(false)}
          className={({ isActive }) => 
            isActive 
              ? "active-link flexStart gap-x-4 p-3 pl-6 rounded-full transition-all duration-300 w-full" 
              : "flexStart gap-x-4 p-3 pl-6 rounded-full hover:text-secondary transition-all duration-300 w-full"
          }
        >
          <span className="text-xl">{icon}</span>
          <h5 className="medium-16">{label}</h5>
        </NavLink>
      ))}
    </nav>
  )
}

export default Navbar