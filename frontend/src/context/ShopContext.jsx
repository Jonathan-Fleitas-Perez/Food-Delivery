import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios'

// eslint-disable-next-line react-refresh/only-export-components
export const ShopConstest = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const deliveryCharges =0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate();
  
  const [foods, setFoods] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cartItems, setCartItems] = useState({});

  //Agregar elemento al carrito
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select the size first");
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) cartData[itemId][size] += 1;
      else cartData[itemId][size] = 1;
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    if(token){
      try {
        const response = await axios.post(backendUrl+'/api/cart/add',{itemId,size},{headers:{token}})
        if(response.data.success)
          toast.success(response.data.message)
        else
          toast.error(response.data.message)

      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  };

  //Agregar cuenta al icono del carrito
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) totalCount += cartItems[items][item];
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  };

  //Actualizar el contador del carrito
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if(token){
      try {
        const response =await axios.post(backendUrl+'/api/cart/update',{itemId,size,quantity},{headers:{token}})
        
        if(response.data.success)
          toast.success(response.data.message)
        else
          toast.error(response.data.message)

      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  };

  //Obtener cuenta total
  const getCartAmount = ()=>{
    let totalAmount = 0
    for(const items in cartItems){
      let filtered = foods.find((food)=> food._id === items)
      for(const item in cartItems[items]){
        try {
          if(cartItems[items][item]>0)
            totalAmount += filtered.price[item]*cartItems[items][item]
        } catch (error) {
          console.log(error)
        }
      }
    }
    return totalAmount
  }

  //obtener las comidas de la base de datos
  const getProductsData = async()=>{
    try {
      console.log('entro aqui')
      const response = await axios.get(backendUrl+'/api/product/list')
      if(response.data.success)
        setFoods(response.data.products)
      else
        toast.error(response.data.message)
    } catch (error) {
      console.log('Error en obtener los productos',error)
      toast.error(error.message)
    }
  }

  //obtener el carrito del Usuario
  const getUserCart = async(token)=>{
    try {
      const response = await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}})
      if(response.date.success)
        setCartItems(response.data.cartData)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(!token && localStorage.getItem('token')){
      setToken(localStorage.getItem('token'))
      getUserCart(localStorage.getItem('token'))
    }
      
    getProductsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const isCartEmpty = () => {
  return Object.values(cartItems).every(
    sizeObj => Object.values(sizeObj).every(qty => qty <= 0)
  );
};

  const contextValue = {
    foods,
    currency,
    navigate,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    token,
    isCartEmpty,
    setToken,
    updateQuantity,
    getCartAmount,
    deliveryCharges,
    backendUrl
  };

  return (
    <ShopConstest.Provider value={contextValue}>
      {props.children}
    </ShopConstest.Provider>
  );
};

export default ShopContextProvider;
