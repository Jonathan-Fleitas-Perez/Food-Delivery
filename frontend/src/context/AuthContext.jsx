import  { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    permissions: [],
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const decodedToken = JSON.parse(atob(userData.token.split('.')[1]));
          
          if (decodedToken.exp * 1000 > Date.now()) {
            setAuthState({
              user: userData,
              permissions: userData.permissions || [],
              isLoading: false,
            });
          } else {
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
  }, []);

  const login = (token, userData) => {
    const user = { token, ...userData };
    localStorage.setItem("user", JSON.stringify(user));
    setAuthState({
      user,
      permissions: userData.permissions || [],
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      permissions: [],
      isLoading: false,
    });
    navigate("/login");
  };

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