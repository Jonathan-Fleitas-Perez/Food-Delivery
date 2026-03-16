import  { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    permissions: [],
    isLoading: true,
  });
  const navigate = useNavigate();

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    const decoded = JSON.parse(atob(token.split('.')[1]));
    setAuthState({
      user: { id: decoded.id, role: decoded.role, name: decoded.name, ...userData },
      permissions: decoded.permissions || [],
      isLoading: false,
    });
  };

  const logout = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.post(`${backendUrl}/api/user/logout`);
    } catch (e) { console.error(e); }
    
    localStorage.removeItem("token");
    setAuthState({
      user: null,
      permissions: [],
      isLoading: false,
    });
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token"); // Usado como señal
      if (storedToken) {
        try {
          const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
          
          if (decodedToken.exp * 1000 > Date.now()) {
            setAuthState({
              user: { id: decodedToken.id, role: decodedToken.role, name: decodedToken.name },
              permissions: decodedToken.permissions || [],
              isLoading: false,
            });
          } else {
            // Intentar refrescar vía interceptor o llamar a logout
            // Por simplicidad, si expira aquí, intentamos un ping o logout
            logout();
          }
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);