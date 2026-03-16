import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logoS.png";
import Navbar from "./Navbar"
import {CgMenuLeft} from 'react-icons/cg'
import  {TbUserCircle , TbArrowNarrowRight} from 'react-icons/tb'
import {RiUserLine , RiShoppingBag4Line} from 'react-icons/ri'
import { ShopConstest } from "../context/ShopContext";


const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [profileMenuOpened, setProfileMenuOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {token,navigate,getCartCount,logout,user}= useContext(ShopConstest)
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = ()=>{setMenuOpened((prev)=> !prev);} //Funcion para abrir y cerrar el menu lateral en mobile

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/70 backdrop-blur-md py-2 shadow-sm" 
        : "bg-white py-3"
    }`}>
      <div className="max-padd-container flexBetween">
        {/* Logo */}
        <Link to={"/"} className="bold-24 flex flex-1 items-baseline z-50">
          <img src={logo} alt="Logo de la empresa" height={24} width={24} className="hidden sm:flex"/>
          <span className="text-secondary pl-2">Sudy's</span> <span className="pl-2">Food</span>
        </Link>

        {/* NavBar & Sidebar Overlay */}
        <div className="flex-1">
          {/* Overlay for Mobile Menu */}
          {menuOpened && (
            <div 
              className="xl:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
              onClick={toggleMenu}
            />
          )}

          {/* Sidebar / Navbar */}
          <div className={`
            fixed xl:static top-0 left-0 h-screen xl:h-auto w-72 xl:w-auto
            bg-white xl:bg-transparent z-50 xl:z-auto
            transition-transform duration-300 ease-in-out
            ${menuOpened ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
            shadow-2xl xl:shadow-none p-6 pt-10 xl:p-0
          `}>
            {/* Mobile Close Button (Aligned with items) */}
            <div className="xl:hidden flex justify-end mb-10 pr-4">
              <button 
                onClick={toggleMenu}
                className="p-3 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all shadow-sm"
              >
                <TbArrowNarrowRight className="text-2xl rotate-180" />
              </button>
            </div>

            <Navbar containerStyles="flex flex-col xl:flex-row gap-y-4 xl:gap-x-8" setMenuOpened={setMenuOpened} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-end gap-x-3 sm:gap-x-6 z-50">
          {!menuOpened && (
            <CgMenuLeft 
              onClick={toggleMenu} 
              className="text-3xl xl:hidden cursor-pointer hover:text-secondary transition-colors"
            />
          )}
          
          <Link className="flex relative group" to={'/cart'}> 
            <RiShoppingBag4Line className="text-2xl group-hover:text-secondary transition-colors"/>
            <span className="bg-secondary text-white medium-12 absolute -right-2 -top-2 flexCenter w-5 h-5 rounded-full shadow-md">
              {getCartCount()}
            </span>
          </Link>

          <div className="relative">
             {token ? (
              <div className="cursor-pointer" onClick={() => setProfileMenuOpened(!profileMenuOpened)}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Perfil" className="w-9 h-9 rounded-full object-cover border-2 border-secondary/20 hover:border-secondary transition-all" />
                ) : (
                  <TbUserCircle className="text-[32px] text-gray-700 hover:text-secondary transition-colors" />
                )}
              </div>
             ) : (
              <button className="btn-secondary !py-2 !px-5 flexCenter gap-x-2 rounded-full" onClick={()=>navigate('/login')}>
                Entrar
              </button>
             )}

            {token && (
              <ul className={`bg-white shadow-xl p-3 w-44 ring-1 ring-slate-900/5 rounded-xl absolute right-0 top-12 flex-col z-50 transition-all ${profileMenuOpened ? "flex" : "hidden"}`}>
                <li className="flexBetween cursor-pointer p-2 hover:bg-secondary/5 hover:text-secondary rounded-lg transition-all" 
                  onClick={() => {
                    navigate('/profile');
                    setProfileMenuOpened(false);
                  }}
                >
                  <p className="medium-15">Mi Perfil</p> 
                  <TbArrowNarrowRight className="opacity-50 text-[19px]"/>
                </li>
                <hr className="my-2 border-gray-100"/>
                <li className="flexBetween cursor-pointer p-2 hover:bg-secondary/5 hover:text-secondary rounded-lg transition-all" 
                  onClick={() => {
                    navigate('/orders');
                    setProfileMenuOpened(false);
                  }}
                >
                  <p className="medium-15">Pedidos</p> 
                  <TbArrowNarrowRight className="opacity-50 text-[19px]"/>
                </li>
                <hr className="my-2 border-gray-100"/>
                <li className="flexBetween cursor-pointer p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                  onClick={() => {
                    logout();
                    setProfileMenuOpened(false);
                  }}
                >
                  <p className="medium-15">Salir</p> 
                  <TbArrowNarrowRight className="opacity-50 text-[19px]"/>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
