import React, { useState } from 'react'
import upload_icon from '../assets/upload_icon.png'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token , permissions}) => {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [popular, setPopular] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category/list`);
        if (response.data.success) {
          setCategories(response.data.data);
          if (response.data.data.length > 0) {
            setCategory(response.data.data[0].name);
          }
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);
  
  // Estados para manejar errores
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  })
  // Verificar si tiene permiso para crear productos
  const canCreateProducts = permissions.includes('products:create')

  const handleImageChange = (e)=>{
    if (isSubmitting) return; 
    
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      toast.error('Solo se permiten imágenes JPEG, PNG o WebP')
      setImage(null)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      setImage(null)
      return
    }
    
    setImage(file)
    setErrors(prev => ({...prev, image: ''}))
  }

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      image: '',
      price: ''
    }
    
    let isValid = true
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
      isValid = false
    } else if (name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
      isValid = false
    }
    
    if (description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres'
      isValid = false
    }
    
    if (!image) {
      newErrors.image = 'Debes subir una imagen'
      isValid = false
    }
    
    const priceValue = parseFloat(price)
    if (!price || isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = 'Debe ingresar un precio válido'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('popular', popular)
      formData.append('image', image)
      formData.append('price', Number(price))
      
      const response = await axios.post(
        `${backendUrl}/api/product/add`, 
        formData, 
        {
          headers: {
            Authorization:`Bearer ${token}`, 
            'Content-Type':'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setPrice('')
        setImage(null)
        setPopular(false)
        setErrors({ name: '', description: '', image: '', price: '' })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agregar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canCreateProducts) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Acceso no autorizado</h2>
          <p className="mt-2 text-gray-700">No tienes permiso para agregar productos.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className='px-2 sm:px-8'>
      <form className='flex flex-col gap-y-3 medium-14 lg:w-[777px]' onSubmit={onSubmitHandler}>
        <div className='w-full'>
          <h5 className='h5'>Nombre del Producto</h5>
          <input 
            type="text" 
            placeholder='Escribe aquí' 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            className={`px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg ${errors.name ? 'border border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className='w-full'>
          <h5 className='h5'>Descripción del Producto</h5>
          <textarea 
            rows={5} 
            placeholder='Escribe aquí' 
            onChange={(e) => setDescription(e.target.value)} 
            value={description} 
            className={`px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg ${errors.description ? 'border border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div className='flex items-end gap-x-6'>
          <div>
            <h5 className='h5'>Categoría</h5>
            <select 
              onChange={(e) => setCategory(e.target.value)} 
              value={category} 
              className='px-3 py-2 mt-1 bg-white rounded ring-1 ring-slate-900/10 sm:w-full text-gray-30'
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col gap-2 pt-2'>
            <label htmlFor="image">
              <img 
                src={image ? URL.createObjectURL(image) : upload_icon} 
                alt="image" 
                className={`w-14 h-14 aspect-square object-cover ring-1 ring-slate-900/5 bg-white rounded-lg ${errors.image ? 'border-2 border-red-500' : ''}`}
              />
              <input 
                type="file" 
                onChange={handleImageChange} 
                id='image' 
                hidden 
                accept="image/jpeg, image/png, image/webp"
                disabled={isSubmitting}
              />
            </label>
            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
          </div>
        </div>

        <div className='w-full max-w-lg'>
          <h5 className='h5'>Precio</h5>
          <input 
            type="number" 
            placeholder='Precio del producto' 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            min={0}
            step="0.01"
            className={`px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full ${errors.price ? 'border border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>

        <div className='gap-2 my-2 flexStart'>
          <input 
            onChange={() => setPopular((prev) => !prev)} 
            type="checkbox" 
            checked={popular} 
            id='popular' 
            disabled={isSubmitting}
          />
          <label htmlFor="popular" className='cursor-pointer'>Añadir a populares</label>
        </div>
        
        <button 
          type='submit' 
          className='btn-dark !rounded mt-3 max-w-44 sm:w-full flex justify-center items-center h-10'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Agregando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  )
}

export default Add