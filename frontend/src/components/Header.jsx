import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import Navbar from "./Navbar"
import {CgMenuLeft} from 'react-icons/cg'
import  {TbUserCircle , TbArrowNarrowRight} from 'react-icons/tb'
import {RiUserLine , RiShoppingBag4Line} from 'react-icons/ri'
import { ShopConstest } from "../context/ShopContext";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const {token,navigate,getCartCount,setToken}= useContext(ShopConstest)
  

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
  }
  const toggleMenu = ()=>{setMenuOpened((prev)=> !prev);} //Funcion para abrir y cerrar el menu lateral en mobile

  return (
    <header className="py-3 w-full absolute top-0 left-0 right-0 z-50 bg-white">
      <div className="max-padd-container flexBetween">
        {/*Logo */}
        <Link to={"/"} className="bold-24 flex flex-1   items-baseline">
          <img src={logo} alt="Logo de la empresa" height={24} width={24} className="hidden sm:flex"/>
          <span className="text-secondary pl-2">Food</span> <span className="pl-2">Delivery</span>
        </Link>

        {/*NavBar */}
        <div className="flex-1">
          <Navbar  toggleMenu={toggleMenu} menuOpened={menuOpened} containerStyles={`${menuOpened ?
             'flex flex-col gap-y-12 h-screen w-[222px] absolute left-0 top-0 bg-white z-50 px-10 py-4 shadow-xl'
             :'hidden xl:flex gap-x-5 xl:gap-x-8 medium-15 rounded-full px-2 py-1'}`}/>
        </div>

        {/*Right side */}
        <div className="flex-1 flex items-center justify-end gap-x-3 sm:gap-x-10">
          {!menuOpened && (<CgMenuLeft onClick={toggleMenu} className="text-2xl xl:hidden cursor-pointer"/>)}
          <Link className="flex relative" to={'/cart'}> 
            <RiShoppingBag4Line className="text-2xl"/>
            <span className="bg-secondary text-white medium-14 absolute left-3.5 -top-2.5 flexCenter w-4 h-4 rounded-full shadow-inner">{getCartCount()}</span>
          </Link>

          <div className="group relative">
            <div onClick={()=>!token && navigate('/login')}>
             {token ? (<div className="my-[9px]"><TbUserCircle className="text-[29px] cursor-pointer"/></div> )
             :(<button className="btn-outline !border-none flexCenter gap-x-2">Login<RiUserLine className="text-xl"/></button>)}
            </div>

            {token && <>
              <ul className="bg-white shadow-sm p-2 ww-32 ring-1 ring-slate-900/15 rounded absolute right-0 top-10 hidden group-hover:flex flex-col">
                <li className="flexBetween cursor-pointer" onClick={()=>navigate('/orders')}><p>Orders </p> <TbArrowNarrowRight className="opacity-50 text-[19px]"/></li>
                <hr  className="my-2"/>
                <li className="flexBetween cursor-pointer" onClick={()=>logout}><p>Logout </p> <TbArrowNarrowRight className="opacity-50 text-[19px]"/></li>
              </ul>
            </>}
          </div>
        </div>
 
      </div>
    </header>
  );
};

export default Header;
