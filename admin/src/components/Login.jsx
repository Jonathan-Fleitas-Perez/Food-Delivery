import { useState } from 'react'
import loginImg from '../assets/Login.png'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = ({ settoken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      
      // Validar formulario
      if (!validateForm()) return
      
      setIsLoading(true)
      const response = await axios.post(`${backendUrl}/api/user/login`, { email, password })
      
      if (response.data.success) {
        const token = response.data.token
        
        // Decodificar token para obtener el rol
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        const role = payload.role || 'customer'
        
        // Verificar si el usuario tiene acceso al panel admin
        if (role === 'admin' || role === 'manager') {
          settoken(token)
          toast.success(`Bienvenido, ${payload.name || 'Administrador'}`)
        } else {
          // Usuarios normales no pueden acceder al panel
          toast.error('No tienes permiso para acceder al panel de administración')
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      
      // Manejar errores específicos
      if (error.response) {
        const { status, data } = error.response
        if (status === 401) {
          toast.error('Credenciales inválidas')
        } else if (status === 403) {
          toast.error('Acceso denegado')
        } else {
          toast.error(data.message || 'Error en el inicio de sesión')
        }
      } else {
        toast.error('Error de conexión con el servidor')
      }
    } finally {
      setIsLoading(false)
    }
  }

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
              <h3 className='text-gray-900 bold-36'>Panel de Administración</h3>
              <p className='mt-2 text-gray-600 medium-15'>Ingrese sus credenciales para acceder</p>
            </div>
            
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
                  Verificando...
                </>
              ) : 'Iniciar Sesión'}
            </button>

            <div className="mt-4 text-sm text-center text-gray-600">
              <p>¿Problemas para acceder? Contacta al administrador</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login