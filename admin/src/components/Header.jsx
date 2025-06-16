import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Header = () => {
  return (
    <header className="max-padd-container flexCenter py-4 bg-white">
      {/*Logo*/}
      <Link to={"/"} className="bold-24 flex items-baseline">
        <img
          src={logo}
          alt="Logo de la empresa"
          height={24}
          width={24}
          className="hidden sm:flex"
        />
        <span className="text-secondary pl-2">Food</span>{" "}
        <span className="pl-2">Delivery</span>
      </Link>
    </header>
  );
};

export default Header;
