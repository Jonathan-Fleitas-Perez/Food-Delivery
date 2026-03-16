import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [image, setImage] = useState(false);
  const [editImage, setEditImage] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/category/add`, newCategory, {
        headers: { Authorization: `Bearer ${token}`, token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setNewCategory({ name: '', image: '' });
        setShowAddModal(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleUpdateCategory = async (id) => {
    try {
      const response = await axios.put(`${backendUrl}/api/category/${id}`, editingCategory, {
        headers: { Authorization: `Bearer ${token}`, token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/category/${id}`, {
        headers: { Authorization: `Bearer ${token}`, token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='p-4 sm:p-8 bg-white rounded-xl shadow-sm min-h-screen'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-800'>Gestión de Categorías</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className='flexCenter gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm'
        >
          <FaPlus /> Agregar Categoría
        </button>
      </div>

      {loading ? (
        <div className='flexCenter h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map((cat) => (
            <div key={cat._id} className='p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group'>
              {editingCategory && editingCategory._id === cat._id ? (
                <div className='space-y-4'>
                  <input 
                    type='text'
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none'
                  />
                  <div className='flex items-center gap-4'>
                      <label htmlFor={`edit-image-${cat._id}`} className='cursor-pointer'>
                          <div className='w-16 h-16 border rounded-lg flexCenter overflow-hidden bg-white'>
                              {editImage ? (
                                  <img src={URL.createObjectURL(editImage)} alt="Preview" className='w-full h-full object-cover' />
                              ) : (
                                  cat.image ? (
                                      <img src={cat.image} alt={cat.name} className='w-full h-full object-cover' />
                                  ) : (
                                      <FaPlus className='text-gray-300' />
                                  )
                              )}
                          </div>
                      </label>
                      <input 
                          type='file'
                          id={`edit-image-${cat._id}`}
                          hidden
                          onChange={(e) => setEditImage(e.target.files[0])}
                      />
                      <span className='text-xs text-gray-400'>Click para cambiar imagen</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input 
                      type='checkbox'
                      checked={editingCategory.active}
                      onChange={(e) => setEditingCategory({...editingCategory, active: e.target.checked})}
                      id={`active-${cat._id}`}
                    />
                    <label htmlFor={`active-${cat._id}`} className='text-sm text-gray-600'>Activa</label>
                  </div>
                <div className='flex gap-2 pt-2'>
                    <button onClick={() => handleUpdateCategory(cat._id)} className='flex-1 bg-green-500 text-white py-2 rounded flexCenter gap-1 hover:bg-green-600'><FaSave /> Guardar</button>
                    <button onClick={() => { setEditingCategory(null); setEditImage(false); }} className='flex-1 bg-gray-400 text-white py-2 rounded flexCenter gap-1 hover:bg-gray-500'><FaTimes /> Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex items-center gap-4'>
                      {cat.image && (
                        <div className='w-12 h-12 bg-white rounded-full flexCenter border overflow-hidden shadow-sm'>
                          <img src={cat.image} alt={cat.name} className='w-10 h-10 object-contain' />
                        </div>
                      )}
                      <div>
                        <h3 className='font-bold text-lg text-gray-800'>{cat.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cat.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-4'>
                    <button onClick={() => setEditingCategory(cat)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors' title="Editar"><FaEdit /></button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors' title="Eliminar"><FaTrash /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Agregar */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flexCenter p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-300'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold'>Nueva Categoría</h3>
              <button 
                onClick={() => { setShowAddModal(false); setImage(false); }}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              ><FaTimes /></button>
            </div>
            <form onSubmit={handleAddCategory} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre</label>
                <input 
                  type='text'
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-secondary/50 outline-none bg-gray-50'
                  placeholder='Ej: Pizza'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Imagen de Categoría</label>
                <div className='flex items-center gap-4'>
                    <label htmlFor="image" className='cursor-pointer'>
                        <div className='w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flexCenter overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors'>
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="Preview" className='w-full h-full object-cover' />
                            ) : (
                                <FaPlus className='text-gray-400' />
                            )}
                        </div>
                    </label>
                    <input 
                        type='file'
                        id="image"
                        hidden
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    <span className='text-xs text-gray-400'>Opcional. Formatos aceptados: JPG, PNG, WEBP</span>
                </div>
              </div>
              <button 
                type='submit'
                className='w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-md mt-4'
              >Crear Categoría</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
