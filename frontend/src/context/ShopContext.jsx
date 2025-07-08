/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';

export const ShopConstest = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const deliveryCharges = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  
  const [foods, setFoods] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para decodificar el token JWT
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Verificar y cargar el usuario al inicio
  useEffect(() => {
    const loadUser = () => {
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          });
          setPermissions(decoded.permissions || []);
          getUserCart(token);
        } else {
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
    getProductsData();
  }, []);

  // Función de login
  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    const decoded = decodeToken(token);
    
    if (decoded) {
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      });
      setPermissions(decoded.permissions || []);
      getUserCart(token);
    }
    
    navigate('/');
    toast.success('¡Bienvenido!');
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPermissions([]);
    setCartItems({});
    navigate('/login');
    toast.info('Sesión cerrada');
  };

  // Agregar elemento al carrito
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Por favor selecciona un tamaño primero");
      return;
    }

    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`, 
          { itemId, size },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Error al agregar al carrito');
      }
    }
  };

  // Obtener conteo del carrito
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        totalCount += cartItems[itemId][size] || 0;
      }
    }
    return totalCount;
  };

  // Actualizar cantidad en carrito
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = { ...cartItems };
    
    if (quantity <= 0) {
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        // Eliminar el item si no quedan tamaños
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      if (!cartData[itemId]) cartData[itemId] = {};
      cartData[itemId][size] = quantity;
    }
    
    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Error al actualizar carrito');
      }
    }
  };

  // Calcular total del carrito
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = foods.find(food => food._id === itemId);
      if (product) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          const price = product.price[size] || 0;
          totalAmount += price * quantity;
        }
      }
    }
    return totalAmount;
  };

  // Obtener productos
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list/all`);
      if (response.data.success) {
        setFoods(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      toast.error(error.response?.data?.message || 'Error al cargar productos');
    }
  };

  // Obtener carrito del usuario
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al cargar carrito');
    }
  };

  // Verificar si el carrito está vacío
  const isCartEmpty = () => {
    return Object.keys(cartItems).length === 0;
  };

  // Verificar permisos
  const hasPermission = (permission) => {
    return permissions.includes(permission);
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
    updateQuantity,
    getCartAmount,
    deliveryCharges,
    backendUrl,
    // Funcionalidad de autenticación
    user,
    permissions,
    isLoading,
    login,
    logout,
    hasPermission
  };

  return (
    <ShopConstest.Provider value={contextValue}>
      {props.children}
    </ShopConstest.Provider>
  );
};

export default ShopContextProvider;