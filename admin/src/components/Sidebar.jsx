import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { FaSquarePlus } from "react-icons/fa6";
import { FaListAlt, FaBars, FaTimes } from "react-icons/fa";
import { MdFactCheck, MdLocalOffer } from "react-icons/md";
import { BiLogOut, BiCategory } from "react-icons/bi";
import { FaUsers, FaChartBar, FaMapMarkedAlt } from "react-icons/fa";

const Sidebar = ({ token, setToken, userRole, permissions }) => {
  const hasPermission = (resource, action) => {
    return permissions.includes(`${resource}:${action}`);
  };

  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "active-link"
      : "flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl";

  const handleNav = () => setOpen(false);

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden fixed top-3 right-3 z-50 bg-white p-2 rounded-lg shadow-md text-xl text-gray-700"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay en móvil */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed sm:relative top-0 left-0 z-40
        bg-white rounded flex flex-col
        w-64 sm:w-1/5 h-full sm:min-h-screen
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        pb-3
      `}
      >
        <div className="flex flex-col flex-1 pt-20 sm:pt-5">
          <div className="flex flex-col gap-y-2 sm:pt-10 flex-grow">
            {hasPermission("dashboard", "read") && (
              <NavLink to={"/"} className={linkClass} onClick={handleNav}>
                <FaChartBar />
                <span>Panel</span>
              </NavLink>
            )}

            {hasPermission("products", "create") && (
              <NavLink to={"/add"} className={linkClass} onClick={handleNav}>
                <FaSquarePlus />
                <span>Agregar</span>
              </NavLink>
            )}

            {hasPermission("products", "read") && (
              <NavLink to={"/list"} className={linkClass} onClick={handleNav}>
                <FaListAlt />
                <span>Listado</span>
              </NavLink>
            )}

            {hasPermission("orders", "read") && (
              <NavLink to={"/orders"} className={linkClass} onClick={handleNav}>
                <MdFactCheck />
                <span>Pedidos</span>
              </NavLink>
            )}

            {hasPermission("products", "read") && (
              <NavLink to={"/offers"} className={linkClass} onClick={handleNav}>
                <MdLocalOffer />
                <span>Ofertas</span>
              </NavLink>
            )}

            {userRole === "admin" && (
              <>
                <NavLink
                  to={"/municipalities"}
                  className={linkClass}
                  onClick={handleNav}
                >
                  <FaMapMarkedAlt />
                  <span>Zonas</span>
                </NavLink>
                {hasPermission("categories", "read") && (
                  <NavLink
                    to={"/categories"}
                    className={linkClass}
                    onClick={handleNav}
                  >
                    <BiCategory />
                    <span>Categorías</span>
                  </NavLink>
                )}
                <NavLink
                  to={"/users"}
                  className={linkClass}
                  onClick={handleNav}
                >
                  <FaUsers />
                  <span>Usuarios</span>
                </NavLink>
              </>
            )}
          </div>

          <div className="mt-auto mb-4 pl-4 sm:pl-0">
            {token && (
              <button
                onClick={async () => {
                  try {
                    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/logout`);
                  } catch (e) { console.error(e); }
                  setToken("");
                  handleNav();
                }}
                className="h-10 p-5 text-red-500 cursor-pointer flexStart gap-x-2 sm:pl-12 medium-15 rounded-xl"
              >
                <BiLogOut className="text-xl" />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
