import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const EditProductModal = ({ product, token, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: {},
    popular: false,
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = ['Curry', 'Pizza', 'Rice', 'Deserts','Drinks','Fruits'];

  useEffect(() => {
    if (product) {
      // Convertir precio a objeto si es necesario
      const priceObj = typeof product.price === 'object' 
        ? product.price 
        : JSON.parse(product.price || '{}');
      
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: priceObj,
        popular: product.popular || false,
        image: null
      });
      setImagePreview(product.image);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (size, value) => {
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [size]: Number(value)
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match('image/jpeg|image/png|image/webp')) {
        toast.error('Solo se permiten imágenes JPEG, PNG o WebP');
        return;
      }
      
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      
      // Actualizar formData
      setFormData(prev => ({ ...prev, image: file }));
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Crear FormData para enviar
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('category', formData.category);
      formPayload.append('popular', formData.popular);

        const pricesArray = Object.entries(formData.price).length > 0
      ? Object.entries(formData.price).map(([size, price]) => ({
          size,
          price: Number(price)
        }))
      : []; 
    
      
    formPayload.append('prices', JSON.stringify(pricesArray));
      
      // Agregar nueva imagen si existe
      if (formData.image) {
        formPayload.append('image', formData.image);
      }
      
      // Enviar solicitud PUT
      const response = await axios.put(
        `${backendUrl}/api/product/${product._id}`,
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            token
          }
        }
      );

      if (response.data.success) {
        toast.success('¡Producto actualizado correctamente!');
        onProductUpdated();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      toast.error(error.response?.data?.message || 'Error actualizando producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Editar Producto</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Imagen</label>
            <div className="flex flex-col items-center mb-3">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="object-cover w-32 h-32 mb-2 rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="w-full p-2 text-sm border rounded"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Formatos: JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Nombre*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Categoría*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Precios</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(formData.price).map(([size, price]) => (
                <div key={size} className="flex items-center">
                  <span className="w-20 capitalize">{size}:</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(size, e.target.value)}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="popular"
              checked={formData.popular}
              onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
              className="mr-2"
              id="popular-checkbox"
              disabled={isSubmitting}
            />
            <label htmlFor="popular-checkbox" className="text-sm">
              Producto Destacado
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;