import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { TbTrash, TbEdit, TbFilter, TbSearch } from 'react-icons/tb';
import EditProductModal from '../components/EditProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isFetchingDetails, setIsFetchingDetails] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list/all`);
      
      if (response.data.success) {
        const products = response.data.products;
        setList(products);
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        setCategories(['all', ...uniqueCategories]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Error cargando productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplicar filtros y búsqueda
  const applyFilters = useCallback(() => {
    let result = [...list];
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
    
    // Aplicar filtro de categoría
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Aplicar ordenamiento
    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => getMinPrice(a.price) - getMinPrice(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => getMinPrice(b.price) - getMinPrice(a.price));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      default:
        break;
    }
    
    // Calcular páginas
    const totalPages = Math.ceil(result.length / itemsPerPage);
    setTotalPages(totalPages);
    
    // Paginar
    return result.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [list, searchTerm, selectedCategory, sortOption, page, itemsPerPage]);

  // Actualizar lista filtrada cuando cambian los filtros o la lista
  useEffect(() => {
    if (list.length > 0) {
      const filtered = applyFilters();
      setFilteredList(filtered);
    }
  }, [list, applyFilters]);

  const fetchProductDetails = async (id) => {
    setIsFetchingDetails(prev => ({ ...prev, [id]: true }));
    try {
      const response = await axios.get(`${backendUrl}/api/product/${id}`, {
        headers: { token }
      });
      
      console.log('Detalles del producto:', response.data);
      
      if (response.data.success) {
        setEditingProduct(response.data.product);
        setIsModalOpen(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error(error.response?.data?.message || 'Error cargando detalles');
    } finally {
      setIsFetchingDetails(prev => ({ ...prev, [id]: false }));
    }
  };

  const openDeleteConfirmation = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const removeProduct = async () => {
    if (!productToDelete) return;
    
    const id = productToDelete;
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await axios.delete(
        `${backendUrl}/api/product/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Producto eliminado correctamente');
        
        // Actualizar lista completa desde el servidor
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error(error.response?.data?.message || 'Error eliminando producto');
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
      closeDeleteConfirmation();
    }
  };

  const handleProductUpdated = () => {
    fetchList();
    setIsModalOpen(false);
  };

  // Función para obtener el precio mínimo
  const getMinPrice = (priceObj) => {
    if (!priceObj || Object.keys(priceObj).length === 0) return 0;
    
    const prices = Object.values(priceObj).filter(price => !isNaN(price));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return price > 0 ? currency + price : 'N/A';
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className='px-2 sm:px-8'>
      {isModalOpen && editingProduct && (
        <EditProductModal
          product={editingProduct}
          token={token}
          onClose={() => setIsModalOpen(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteConfirmation}
        onConfirm={removeProduct}
        productName={list.find(p => p._id === productToDelete)?.name || ''}
        isDeleting={isDeleting[productToDelete]}
      />

      <div className='flex flex-col gap-4 mb-4'>
        <h1 className='text-xl font-bold'>Lista de Productos</h1>
        
        {/* Barra de búsqueda y filtros */}
        <div className='flex flex-col gap-3 p-3 bg-white rounded-lg shadow-sm'>
          <div className='flex items-center gap-2'>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-1 px-3 py-2 transition-colors bg-gray-100 rounded-md hover:bg-gray-200'
            >
              <TbFilter className='text-gray-700' />
              <span>Filtros</span>
            </button>
            
            <div className='relative flex-1'>
              <input
                type='text'
                placeholder='Buscar productos...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <TbSearch className='absolute text-xl text-gray-400 left-3 top-3' />
            </div>
          </div>
          
          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className='grid grid-cols-1 gap-4 p-4 mt-2 rounded-md md:grid-cols-3 bg-gray-50'>
              <div>
                <label className='block mb-2 text-sm font-medium'>Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full p-2 border rounded-md'
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Todas las categorías' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className='block mb-2 text-sm font-medium'>Ordenar por</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className='w-full p-2 border rounded-md'
                >
                  <option value='name-asc'>Nombre (A-Z)</option>
                  <option value='name-desc'>Nombre (Z-A)</option>
                  <option value='price-asc'>Precio (Menor a Mayor)</option>
                  <option value='price-desc'>Precio (Mayor a Menor)</option>
                  <option value='newest'>Más recientes</option>
                  <option value='oldest'>Más antiguos</option>
                </select>
              </div>
              
              <div className='flex items-end'>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortOption('name-asc');
                    setPage(1);
                  }}
                  className='w-full px-4 py-2 transition-colors bg-gray-200 rounded-md hover:bg-gray-300'
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Resumen de filtros */}
        <div className='flex flex-wrap gap-2 text-sm'>
          {searchTerm && (
            <span className='flex items-center px-3 py-1 text-blue-800 bg-blue-100 rounded-full'>
              Buscando: "{searchTerm}"
              <button 
                onClick={() => setSearchTerm('')}
                className='ml-2 text-blue-600 hover:text-blue-800'
              >
                &times;
              </button>
            </span>
          )}
          
          {selectedCategory !== 'all' && (
            <span className='flex items-center px-3 py-1 text-green-800 bg-green-100 rounded-full'>
              Categoría: {selectedCategory}
              <button 
                onClick={() => setSelectedCategory('all')}
                className='ml-2 text-green-600 hover:text-green-800'
              >
                &times;
              </button>
            </span>
          )}
          
          {sortOption !== 'name-asc' && (
            <span className='flex items-center px-3 py-1 text-purple-800 bg-purple-100 rounded-full'>
              Orden: {
                sortOption === 'name-desc' ? 'Nombre (Z-A)' :
                sortOption === 'price-asc' ? 'Precio (↑)' :
                sortOption === 'price-desc' ? 'Precio (↓)' :
                sortOption === 'newest' ? 'Más recientes' : 'Más antiguos'
              }
            </span>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 bg-white bold-14 sm:bold-15 rounded'>
          <h5>Imagen</h5>
          <h5>Nombre</h5>
          <h5>Categoría</h5>
          <h5>Precio</h5>
          <h5>Editar</h5>
          <h5>Eliminar</h5>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin'></div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className='py-4 text-center bg-white rounded-lg'>
            <p>No se encontraron productos</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPage(1);
              }}
              className='px-4 py-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600'
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {filteredList.map((item) => (
              <div key={item._id} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 p-1 bg-white rounded-xl'>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className='object-cover w-12 h-12 rounded-xl'
                />
                <h5 className='text-sm font-semibold'>{item.name}</h5>
                <p className='font-semibold'>{item.category}</p>
                <div className='text-sm font-semibold'>
                  {formatPrice(getMinPrice(item.price))}
                </div>
                <div>
                  {isFetchingDetails[item._id] ? (
                    <div className='w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin'></div>
                  ) : (
                    <TbEdit 
                      onClick={() => fetchProductDetails(item._id)} 
                      className='text-lg text-blue-500 cursor-pointer hover:text-blue-700'
                    />
                  )}
                </div>
                <div>
                  {isDeleting[item._id] ? (
                    <div className='w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin'></div>
                  ) : (
                    <TbTrash 
                      onClick={() => openDeleteConfirmation(item._id)} 
                      className='text-lg text-red-500 cursor-pointer hover:text-red-700'
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className='flex justify-center gap-2 mt-4'>
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md ${
                    page === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      page === pageNum 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    page === totalPages 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default List;