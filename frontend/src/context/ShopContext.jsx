import { useEffect, useState ,createContext, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';

// Contexto importado de ShopContextObject.js


export const ShopConstest = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Definición de Funciones (useCallback) ---

  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`);
    } catch (e) { console.error(e); }
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPermissions([]);
    setCartItems({});
    navigate('/login');
    toast.info('Sesión cerrada');
  }, [backendUrl, navigate]);

  const getCategoriesData = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
    }
  }, [backendUrl]);

  const getProductsData = useCallback(async () => {
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
  }, [backendUrl]);

  const getUserCart = useCallback(async (token) => {
    try {
      if (!token) return;
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
  }, [backendUrl]);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    setToken(token);
    const decoded = decodeToken(token);
    
    if (decoded) {
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar || "",
      });
      setPermissions(decoded.permissions || []);
      getUserCart(token);
    }
    
    navigate('/');
    toast.success('¡Bienvenido!');
  }, [navigate, getUserCart, decodeToken]);

  // --- 2. Efectos (useEffect) ---

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${backendUrl}/api/user/refresh`);
            if (response.data.success) {
              setToken(response.data.token);
              return axios(originalRequest);
            }
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [token, backendUrl, logout]);

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
            avatar: decoded.avatar || "",
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
    getCategoriesData();
  }, [token, decodeToken, logout, getProductsData, getCategoriesData, getUserCart]);

  // --- 3. Resto de la lógica ---

  const addToCart = async (itemId) => {
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`, 
          { itemId },
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

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      totalCount += cartItems[itemId] || 0;
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, quantity) => {
    let cartData = { ...cartItems };
    
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    
    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, quantity },
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

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = foods.find(food => food._id === itemId);
      if (product) {
        const quantity = cartItems[itemId];
        const price = product.price || 0;
        totalAmount += price * quantity;
      }
    }
    return totalAmount;
  };

  const isCartEmpty = () => {
    return Object.keys(cartItems).length === 0;
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const contextValue = {
    foods,
    categories,
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
    setDeliveryCharges,
    backendUrl,
    user,
    setUser,
    permissions,
    isLoading,
    login,
    logout,
    hasPermission,
    refreshFoods: getProductsData
  };

  return (
    <ShopConstest.Provider value={contextValue}>
      {props.children}
    </ShopConstest.Provider>
  );
};

export default ShopContextProvider;