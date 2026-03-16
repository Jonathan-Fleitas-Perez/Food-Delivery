import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "/logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-100/50 ${
      scrolled 
        ? "bg-white/70 backdrop-blur-md py-3 shadow-sm" 
        : "bg-white py-4"
    }`}>
      <div className="max-padd-container flexBetween gap-x-2">
        {/*Logo*/}
        <Link to={"/"} className="bold-24 flex items-baseline z-50">
          <img
            src={logo}
            alt="Logo de la empresa"
            height={24}
            width={24}
            className="flex"
          />
          <span className="text-secondary pl-2">Sudy's</span>{" "}
          <span className="pl-2">Food</span>
        </Link>
        <div className="hidden sm:flex text-gray-400 text-sm font-medium px-3 py-1 rounded-full border border-gray-100">
          Panel de Administración
        </div>
      </div>
    </header>
  );
};

export default Header;
