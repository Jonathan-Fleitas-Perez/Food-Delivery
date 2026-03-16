import React, { useContext } from "react";
import Tittle from "./Tittle";
import { ShopConstest } from "../context/ShopContext";

const CartTotal = () => {
  const { currency, getCartAmount, deliveryCharges } = useContext(ShopConstest);

  return (
    <div className="w-full">
      {/*Tittle */}
      <Tittle title1={"Total del "} title2={"Carrito"} titleStyles={"h3"} />
      <div className="pt-3 flexBetween">
        <h5 className="h5">Subtotal:</h5>
        <p className="h5">{currency} {getCartAmount()}.00 </p>
      </div>
      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1"/>

      <div className="pt-3 flexBetween">
        <h5>Costo de Envío</h5>
        <p>{getCartAmount() === 0 ? "0.00" : `${currency}${deliveryCharges}.00`}</p>
      </div>
      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1"/>

      <div className="pt-3 flexBetween">
        <h5 className="h5">Total</h5>
        <p className="h5">{currency}{getCartAmount() === 0 ? 0.00 : getCartAmount()+deliveryCharges}</p>
      </div>
      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1"/>
    </div>
  );
};

export default CartTotal;
