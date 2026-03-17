import { useEffect, useState ,createContext, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';

// Contexto importado de ShopContextObject.js


// eslint-disable-next-line react-refresh/only-export-components
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
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // --- 1. Definición de Funciones (useCallback) ---

  const preloadImages = useCallback((urls) => {
    return Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = resolve; // Continuar de todos modos si falla
        });
      })
    );
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
        const products = response.data.products;
        setFoods(products);
        
        // Precargar imágenes de productos y activos críticos (logo, hero bg)
        const imagesToPreload = [
          '/logo.png',
          '/src/assets/bg.png',
          ...products.slice(0, 8).map(product => product.image)
        ].filter(url => !!url);
        
        if (imagesToPreload.length > 0) {
          await preloadImages(imagesToPreload);
        }
        setImagesLoaded(true);
      } else {
        toast.error(response.data.message);
        setImagesLoaded(true); // Desbloquear si falla
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      toast.error(error.response?.data?.message || 'Error al cargar productos');
      setImagesLoaded(true); // Desbloquear si falla
    }
  }, [backendUrl, preloadImages]);

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

  const getUserProfile = useCallback(async (authToken) => {
    try {
      const currentToken = authToken || token;
      if (!currentToken) return;

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar || "",
          defaultDeliveryAddress: userData.defaultDeliveryAddress || null
        });
        setPermissions(userData.permissions || []);
      }
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      // No cerramos sesión aquí para evitar bucles si hay error de red temporal
    }
  }, [backendUrl, token]);

  const login = useCallback(async (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    
    // Obtener perfil completo inmediatamente
    await getUserProfile(token);
    await getUserCart(token);
    
    navigate('/');
    toast.success('¡Bienvenido!');
  }, [navigate, getUserCart, getUserProfile]);

  // --- 2. Efectos (useEffect) ---

  useEffect(() => {
    axios.defaults.withCredentials = true;
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Evitar bucles de refresco si la propia ruta de refresh falla con 401
        if (originalRequest.url.includes('/api/user/refresh')) {
          logout();
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${backendUrl}/api/user/refresh`);
            if (response.data.success) {
              const newToken = response.data.token;
              setToken(newToken);
              localStorage.setItem('token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Si el refresco falla, redirigir al login y limpiar estado
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        // Manejar otros errores 401 (ej. refresh token también expirado)
        if (error.response?.status === 401) {
          logout();
        }

        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [backendUrl, logout]);

  useEffect(() => {
    const initApp = async () => {
      // 1. Cargar datos básicos de productos y categorías
      const productsPromise = getProductsData();
      const categoriesPromise = getCategoriesData();
      
      // 2. Cargar usuario si hay token
      let userPromise = Promise.resolve();
      if (token) {
        // En vez de decodificar localmente, traemos el perfil fresco del servidor
        userPromise = Promise.all([
          getUserProfile(token),
          getUserCart(token)
        ]);
      }
      
      // Esperar a que todo lo esencial termine
      await Promise.all([productsPromise, categoriesPromise, userPromise]);
      
      // Verificamos si las imágenes ya se marcaron como cargadas (dentro de getProductsData)
      setIsLoading(false);
    };

    initApp();
  }, [token, getProductsData, getCategoriesData, getUserCart, getUserProfile]);

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
    isLoading: isLoading || !imagesLoaded,
    login,
    logout,
    hasPermission,
    getUserProfile,
    refreshFoods: getProductsData
  };

  return (
    <ShopConstest.Provider value={contextValue}>
      {props.children}
    </ShopConstest.Provider>
  );
};

export default ShopContextProvider;