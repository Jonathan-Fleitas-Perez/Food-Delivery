import React, { useState } from 'react'
import upload_icon from '../assets/upload_icon.png'
import axios from 'axios'
import {TbTrash} from 'react-icons/tb'
import {FaPlus} from 'react-icons/fa6'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {
  const SIZE_OPTIONS = ['S', 'M', 'L'];
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prices, setPrices] = useState([])
  const [category, setCategory] = useState('Curry')
  const [popular, setPopular] = useState(false)
  
  // Estados para manejar errores
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    image: '',
    prices: '',
    sizes: ''
  })

  const handleImageChange = (e)=>{
    const file = e.target.files[0]
    
    // Validación de imagen
    if (!file) return
    
    // Validar tipo de archivo
    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      toast.error('Solo se permiten imágenes JPEG, PNG o WebP')
      setImage(null)
      return
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      setImage(null)
      return
    }
    
    setImage(file)
    setErrors(prev => ({...prev, image: ''}))
  }

  const addSizePrice = () =>{
    setPrices([...prices,{size:'',price:''}])
    setErrors(prev => ({...prev, prices: ''}))
  }

  const handleSizePriceChange = (index, field, value) => {
    const updatePrices = prices.map((item,i) => 
      i === index ? {...item, [field]: value} : item
    )
    setPrices(updatePrices)
    setErrors(prev => ({...prev, prices: ''}))
  }

  const removeSizePrice = (index) => {
    setPrices(prices.filter((_,i) => i !== index))
  }

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      image: '',
      prices: '',
      sizes: ''
    }
    
    let isValid = true
    
    // Validar nombre
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
      isValid = false
    } else if (name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
      isValid = false
    } else if (name.length > 100) {
      newErrors.name = 'El nombre no puede exceder los 100 caracteres'
      isValid = false
    }
    
    // Validar descripción
    if (description.length > 500) {
      newErrors.description = 'La descripción no puede exceder los 500 caracteres'
      isValid = false
    }
    
    // Validar imagen
    if (!image) {
      newErrors.image = 'Debes subir una imagen'
      isValid = false
    }
    
    // Validar precios
    if (prices.length === 0) {
      newErrors.prices = 'Debes agregar al menos un tamaño y precio'
      isValid = false
    } else {
      const hasEmptyFields = prices.some(item => !item.size || !item.price)
      const hasInvalidPrices = prices.some(item => {
        const price = parseFloat(item.price)
        return isNaN(price) || price <= 0
      })
      
      if (hasEmptyFields) {
        newErrors.prices = 'Todos los tamaños y precios deben estar completos'
        isValid = false
      }
      
      if (hasInvalidPrices) {
        newErrors.prices = 'Todos los precios deben ser números positivos'
        isValid = false
      }
      
      // Validar tamaños duplicados
      const sizes = prices.map(item => item.size.toUpperCase())
      const uniqueSizes = [...new Set(sizes)]
      if (sizes.length !== uniqueSizes.length) {
        newErrors.prices = 'No puedes tener tamaños duplicados'
        isValid = false
      }
    }
    
    setErrors(newErrors)
    return isValid
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('popular', popular)
      formData.append('image', image)

     // Convertir precios a números
    prices.forEach((item, index) => {
      formData.append(`prices[${index}][size]`, item.size);
      formData.append(`prices[${index}][price]`, Number(item.price)); // Convertir a número
    });
      
      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {headers: {token, 'Content-Type':'multipart/form-data'}})
      
      if (response.data.success) {
        toast.success(response.data.message)
        // Resetear formulario
        setName('')
        setDescription('')
        setPrices([])
        setImage(null)
        setPopular(false)
        setErrors({
          name: '',
          description: '',
          image: '',
          prices: '',
          sizes: ''
        })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      if (error.response?.data?.errors) {
      const backendErrors = {}
      error.response.data.errors.forEach(err => {
        backendErrors[err.field] = err.message
      })
      setErrors(backendErrors)
      toast.error('Error de validación en el servidor')
    } else {
      toast.error(error.response?.data?.message || 'Error al agregar el producto')
    }
    }
  }

  return (
    <div className='px-2 sm:px-8'>
      <form className='flex flex-col gap-y-3 medium-14 lg:w-[777px]' onSubmit={onSubmitHandler}>
        <div className='w-full'>
          <h5 className='h5'>Product Name</h5>
          <input 
            type="text" 
            placeholder='Write Here' 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            className={`px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg ${errors.name ? 'border border-red-500' : ''}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className='w-full'>
          <h5 className='h5'>Product Description</h5>
          <textarea 
            rows={5} 
            placeholder='Write Here' 
            onChange={(e) => setDescription(e.target.value)} 
            value={description} 
            className={`px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg ${errors.description ? 'border border-red-500' : ''}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/*Categories*/}
        <div className='flex items-end gap-x-6'>
          <div>
            <h5 className='h5'>Category</h5>
            <select 
              onChange={(e) => setCategory(e.target.value)} 
              value={category} 
              className='px-3 py-2 mt-1 bg-white rounded ring-1 ring-slate-900/10 sm:w-full text-gray-30'
            >
              <option value="Curry">Curry</option>
              <option value="Pizza">Pizza</option>
              <option value="Rice">Rice</option>
              <option value="Deserts">Deserts</option>
              <option value="Drinks">Drinks</option>
              <option value="Fruits">Fruits</option>
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
                name='image' 
                id='image' 
                hidden 
                accept="image/jpeg, image/png, image/webp"
              />
            </label>
            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
          </div>
        </div>

        {/*Sizes */}
      <div>
          <h5 className='h5'>Sizes and Pricing</h5>
          {errors.prices && <p className="mb-2 text-sm text-red-500">{errors.prices}</p>}
          
          {prices.map((item, index) => (
            <div key={index} className='flex items-end gap-4 mt-2'>
              {/* Cambiamos input por select con opciones predefinidas */}
              <select
                onChange={(e) => handleSizePriceChange(index, 'size', e.target.value)}
                value={item.size}
                className={`px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white w-20 ${!item.size ? 'border border-red-500' : ''}`}
              >
                {SIZE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <input 
                onChange={(e) => handleSizePriceChange(index, 'price', e.target.value)} 
                value={item.price} 
                type="number" 
                placeholder='Price' 
                min={0}
                step="0.01"
                className={`px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white w-20 ${!item.price || parseFloat(item.price) <= 0 ? 'border border-red-500' : ''}`}
              />
              <button 
                onClick={() => removeSizePrice(index)} 
                type='button' 
                className='text-red-500 !p-2 text-xl'
              >
                <TbTrash/>
              </button>
            </div>
          ))}

          <button 
            onClick={addSizePrice} 
            className='btn-secondary !rounded !text-xs flexCenter gap-x-2 mt-4 !px-3 !py-1'
          > 
            <FaPlus/> Add Sizing
          </button>
        </div>

        <div className='gap-2 my-2 flexStart'>
          <input 
            onChange={() => setPopular((prev) => !prev)} 
            value={popular} 
            type="checkbox" 
            checked={popular} 
            id='popular' 
          />
          <label htmlFor="popular" className='cursor-pointer'>Add to popular</label>
        </div>
        
        <button 
          type='submit' 
          className='btn-dark !rounded mt-3 max-w-44 sm:w-full'
        >
          Add Product
        </button>
      </form>
    </div>
  )
}

export default Add