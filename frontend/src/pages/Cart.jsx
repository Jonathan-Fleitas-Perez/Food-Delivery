import React, { useContext, useEffect, useState } from "react";
import Tittle from "../components/Tittle";
import { ShopConstest } from "../context/ShopContext";
import {FaRegWindowClose} from 'react-icons/fa'
import {FaMinus , FaPlus} from 'react-icons/fa6'
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const Cart = () => {
  const { foods, cartItems, currency, navigate,updateQuantity } = useContext(ShopConstest);
  const [cartData, setCartData] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (foods.length > 0) {
      const tempData = [];
      const initialQuantities = {};

      for (const itemId in cartItems) {
        if (cartItems[itemId] > 0) {
          tempData.push({
            _id: itemId,
            quantity: cartItems[itemId],
          });
          initialQuantities[itemId] = cartItems[itemId];
        }
      }
      setCartData(tempData);
      setQuantities(initialQuantities);
    }
  }, [cartItems, foods]);

  const increment = (id) => {
    const newValue = quantities[id] + 1;
    setQuantities(prev => ({ ...prev, [id]: newValue }));
    updateQuantity(id, newValue);
  };
  
  const decrement = (id) => {
    if (quantities[id] > 1) {
      const newValue = quantities[id] - 1;
      setQuantities(prev => ({ ...prev, [id]: newValue }));
      updateQuantity(id, newValue);
    }
  };
  
  return (
    <section className="mt-24 max-padd-container">
      <div className="pt-6">
        <Tittle title1={"Lista del "} title2={"Carrito"} titleStyles={"h3"} />

        {/*Container*/}
        <div>
          {cartData.map((item, i) => {
            const productData = foods.find(
              (product) => product._id === item._id
            );

            if (!productData) return null;

            return (
              <div key={i} className="p-2 mt-2 bg-white rounded-xl">
                <div className="flex items-center gap-x-3">
                  <div className="flex items-start gap-6 p-2 bg-primary rounded-xl">
                    <img
                      src={productData.image}
                      alt={productData.name}
                      className="w-16 sm:w-18"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flexBetween">
                      <h5 className="h5 !my-0 line-clamp-1">{productData.name}</h5>
                      <FaRegWindowClose onClick={() => updateQuantity(item._id, 0)} className="cursor-pointer text-secondary" />
                    </div>
                    <div className="flexBetween mt-2">
                      <div className="flex items-center overflow-hidden rounded-full ring-1 ring-slate-900/5 bg-primary">
                        <button onClick={() => decrement(item._id)} className="p-1.5 bg-white text-secondary rounded-full shadow-md"><FaMinus className="text-xs" /></button>
                        <p className="px-2">{quantities[item._id]}</p>
                        <button onClick={() => increment(item._id)} className="p-1.5 bg-white text-secondary rounded-full shadow-md"><FaPlus className="text-xs" /></button>
                      </div>
                      <h4 className="h4">{currency}{productData.price}</h4>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex my-20">
          <div className="w-full sm:w-[450px]"> 
            <CartTotal/>
            <button className='btn-dark mt-7'onClick={()=>{if(cartData.length>0)navigate('/place-order'); else toast.error('No puedes realizar el pago sin productos en el carrito')}}>Proceder al Pago</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
