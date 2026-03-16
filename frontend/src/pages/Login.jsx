import { useContext, useEffect, useState } from 'react';
import loginImg from '../assets/Login.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ShopConstest } from '../context/ShopContext';

const Login = () => {
  // Estados para autenticación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para registro
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, user, backendUrl } = useContext(ShopConstest);
  const navigate = useNavigate();

  // Validaciones para login
  const validateLoginForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validaciones para registro
  const validateRegisterForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Debe contener al menos una mayúscula';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Debe contener al menos un número';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      
      // Validar según el modo
      if (isRegistering) {
        if (!validateRegisterForm()) return;
      } else {
        if (!validateLoginForm()) return;
      }

      setIsLoading(true);

      // Registro de usuario
      if (isRegistering) {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password
        });
        
        if (response.data.success) {
          toast.success('Registro exitoso. Inicia sesión ahora.');
          setIsRegistering(false); // Volver a login
          setEmail('');
          setPassword('');
          setName('');
        }
      } 
      // Login de usuario
      else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { 
          email, 
          password 
        });
        
        if (response.data.success) {
          const token = response.data.token;
          login(token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && isRegistering) {
          toast.error('Este correo ya está registrado');
        } else if (status === 401) {
          toast.error('Credenciales inválidas');
        } else {
          toast.error(data.message || 'Error en la operación');
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si el usuario está autenticado, redirigir a la página principal
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <section className='absolute top-0 left-0 z-50 w-full h-full bg-white'>
      {/*Container */}
      <div className='flex w-full h-full'>
        {/* Image a la derecha*/}
        <div className='hidden w-1/2 sm:block'>
          <img src={loginImg} alt="Image Login" className='object-cover w-full h-full' />
        </div>
        {/*Form side */}
        <div className='w-full flexCenter sm:w-1/2'>
          <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'>
            <div className='w-full mb-4 text-center'>
              <h3 className='text-gray-900 bold-36'>
                {isRegistering ? 'Regístrate' : 'Inicia Sesión'}
              </h3>
              <p className='mt-2 text-gray-600 medium-15'>
                {isRegistering 
                  ? 'Crea tu cuenta para comenzar' 
                  : 'Ingresa tus credenciales'
                }
              </p>
            </div>

            {/* Campo nombre solo en registro */}
            {isRegistering && (
              <div className='w-full'>
                <label htmlFor="name" className='block mb-1 medium-15'>Nombre</label>
                <input 
                  type="text" 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  placeholder='Tu nombre' 
                  className={`w-full px-4 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 ${
                    errors.name ? 'ring-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            {/* Campo email */}
            <div className='w-full'>
              <label htmlFor="email" className='block mb-1 medium-15'>Email</label>
              <input 
                type="email" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                placeholder='tu@email.com' 
                className={`w-full px-4 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 ${
                  errors.email ? 'ring-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Campo contraseña */}
            <div className='w-full'>
              <label htmlFor="password" className='block mb-1 medium-15'>Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  placeholder='••••••••' 
                  className={`w-full px-4 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 pr-10 ${
                    errors.password ? 'ring-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirmar contraseña solo en registro */}
            {isRegistering && (
              <div className='w-full'>
                <label htmlFor="confirmPassword" className='block mb-1 medium-15'>Confirmar Contraseña</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  value={confirmPassword} 
                  placeholder='••••••••' 
                  className={`w-full px-4 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 ${
                    errors.confirmPassword ? 'ring-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Botón de acción */}
            <button 
              type='submit' 
              className={`btn-dark w-full mt-5 !py-3 !rounded flex justify-center items-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg 
                    className="w-5 h-5 mr-2 text-white animate-spin" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRegistering ? 'Registrando...' : 'Iniciando...'}
                </>
              ) : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>

            {/* Enlace para cambiar entre modos */}
            <div className="mt-4 text-sm text-center text-gray-600">
              <button 
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrors({});
                }}
                disabled={isLoading}
              >
                {isRegistering 
                  ? '¿Ya tienes cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Regístrate'
                }
              </button>
            </div>

            <div className="mt-4 text-sm text-center text-gray-600">
              <p>¿Problemas para acceder? Contacta al administrador</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;