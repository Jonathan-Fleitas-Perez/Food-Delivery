import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const EditProductModal = ({ product, token, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    popular: false,
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category/list`);
        if (response.data.success) {
          setCategories(response.data.data.map(c => c.name));
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        popular: product.popular || false,
        image: null
      });
      setImagePreview(product.image);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image/jpeg|image/png|image/webp')) {
        toast.error('Solo se permiten imágenes JPEG, PNG o WebP');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
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
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('category', formData.category);
      formPayload.append('popular', formData.popular);
      formPayload.append('price', Number(formData.price));
      
      if (formData.image) {
        formPayload.append('image', formData.image);
      }
      
      const response = await axios.put(
        `${backendUrl}/api/product/${product._id}`,
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization:`Bearer ${token}`
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
      toast.error(error.response?.data?.message || 'Error actualizando producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 blur-none">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">Editar Producto</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <label className="block text-sm font-medium w-full text-left">Imagen</label>
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('edit-image-input').click()}>
              <img 
                src={imagePreview} 
                alt="Product" 
                className="object-cover w-24 h-24 rounded-lg border-2 border-gray-100 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">Cambiar</span>
              </div>
            </div>
            <input
              id="edit-image-input"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Nombre*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              rows="2"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Categoría*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-md outline-none"
                required
                disabled={isSubmitting}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Precio*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              name="popular"
              checked={formData.popular}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
              id="edit-popular"
              disabled={isSubmitting}
            />
            <label htmlFor="edit-popular" className="text-sm text-gray-600 cursor-pointer">
              Marcar como popular
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
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