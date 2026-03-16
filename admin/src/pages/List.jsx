import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { TbTrash, TbEdit, TbFilter, TbSearch, TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import EditProductModal from '../components/EditProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const List = ({ token, permissions }) => {
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
  const [mobileView, setMobileView] = useState(false);
  
  const canReadProducts = permissions.includes('products:read');
  const canUpdateProducts = permissions.includes('products:update');
  const canDeleteProducts = permissions.includes('products:delete');

  const itemsPerPage = 10;

  // Componente Skeleton para filas
  const SkeletonRow = ({ isMobile = false }) => (
    isMobile ? (
      <div className="flex flex-col gap-3 p-4 bg-white shadow-sm rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 p-1 bg-white rounded-xl animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  );

  // Verificar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/category/list`);
      if (response.data.success) {
        setCategories(['all', ...response.data.data.map(c => c.name)]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list/all`);
      
      if (response.data.success) {
        const products = response.data.products;
        setList(products);
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

  useEffect(() => {
    fetchCategories();
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
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
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
        { headers: {Authorization:`Bearer ${token}`} }
      );

      if (response.data.success) {
        toast.success('Producto eliminado correctamente');
        fetchList();
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

  // Función para formatear precio
  const formatPrice = (price) => {
    return price > 0 ? currency + price : 'N/A';
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (!canReadProducts) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Acceso no autorizado</h2>
          <p className="mt-3 text-gray-700">
            No tienes permiso para ver la lista de productos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-2 sm:px-4 md:px-6 lg:px-8'>
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
        <h1 className='text-xl font-bold md:text-2xl'>Lista de Productos</h1>
        
        {/* Barra de búsqueda y filtros */}
        <div className='flex flex-col gap-3 p-3 bg-white rounded-lg shadow-sm'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center justify-center gap-1 px-3 py-2 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 md:w-auto'
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
            <div className='grid grid-cols-1 gap-4 p-4 mt-2 rounded-md md:grid-cols-3 bg-gray-5'>
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
                  className='w-full px-4 py-2 transition-colors bg-gray-20 rounded-md hover:bg-gray-30'
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
        {/* Encabezado solo para escritorio */}
        {!mobileView && (
          <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 bg-white bold-14 sm:bold-15 rounded'>
            <h5>Imagen</h5>
            <h5>Nombre</h5>
            <h5>Categoría</h5>
            <h5>Precio</h5>
            {canUpdateProducts && <h5>Editar</h5>}
            {canDeleteProducts && <h5>Eliminar</h5>}
          </div>
        )}

        {isLoading ? (
          // Mostrar skeletons durante la carga
          [...Array(5)].map((_, index) => (
            <SkeletonRow key={index} isMobile={mobileView} />
          ))
        ) : filteredList.length === 0 ? (
          <div className='py-8 text-center bg-white rounded-lg shadow-sm'>
            <p className='text-gray-600'>No se encontraron productos</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPage(1);
              }}
              className='px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600'
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {filteredList.map((item) => (
              mobileView ? (
                // Vista para móviles
                <div key={item._id} className='flex flex-col gap-3 p-4 bg-white shadow-sm rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <LazyLoadImage
                      src={item.image} 
                      alt={item.name} 
                      className='object-cover w-16 h-16 rounded-xl'
                      effect="blur"
                      placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E"
                      wrapperClassName="w-16 h-16 rounded-xl"
                    />
                    <div>
                      <h5 className='text-base font-semibold'>{item.name}</h5>
                      <p className='text-sm text-gray-500'>{item.category}</p>
                    </div>
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <div className='text-base font-semibold'>
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className='flex gap-2'>
                      {canUpdateProducts && (
                        <div>
                          {isFetchingDetails[item._id] ? (
                            <div className='w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin'></div>
                          ) : (
                            <button 
                              onClick={() => fetchProductDetails(item._id)}
                              className="p-2 text-blue-500 rounded-full bg-blue-50 hover:bg-blue-100"
                              title="Editar"
                            >
                              <TbEdit className='text-lg' />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {canDeleteProducts && (
                        <div>
                          {isDeleting[item._id] ? (
                            <div className='w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin'></div>
                          ) : (
                            <button 
                              onClick={() => openDeleteConfirmation(item._id)}
                              className="p-2 text-red-500 rounded-full bg-red-50 hover:bg-red-100"
                              title="Eliminar"
                            >
                              <TbTrash className='text-lg' />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Vista para escritorio
                <div key={item._id} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 p-1 bg-white rounded-xl'>
                  <LazyLoadImage
                    src={item.image} 
                    alt={item.name} 
                    className='object-cover w-12 h-12 rounded-xl'
                    effect="blur"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E"
                    wrapperClassName="w-12 h-12 rounded-xl"
                  />
                  <h5 className='text-sm font-semibold'>{item.name}</h5>
                  <p className='font-semibold'>{item.category}</p>
                  <div className='text-sm font-semibold'>
                    {formatPrice(item.price)}
                  </div>

                  {canUpdateProducts && (
                    <div className='flex justify-center'>
                      {isFetchingDetails[item._id] ? (
                        <div className='w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin'></div>
                      ) : (
                        <TbEdit 
                          onClick={() => fetchProductDetails(item._id)} 
                          className='text-lg text-blue-500 cursor-pointer hover:text-blue-700'
                        />
                      )}
                    </div>
                  )}
                  
                  {canDeleteProducts && (
                    <div className='flex justify-center'>
                      {isDeleting[item._id] ? (
                        <div className='w-5 h-5 border-t-2 border-red-500 rounded-full animate-spin'></div>
                      ) : (
                        <TbTrash 
                          onClick={() => openDeleteConfirmation(item._id)} 
                          className='text-lg text-red-500 cursor-pointer hover:text-red-700'
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className='flex flex-wrap items-center justify-between gap-4 mt-6'>
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md ${
                    page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <TbChevronLeft className='text-lg' />
                  <span>Anterior</span>
                </button>
                
                <div className='flex items-center gap-1'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = 
                      totalPages <= 5 ? i + 1 : 
                      page <= 3 ? i + 1 : 
                      page >= totalPages - 2 ? i + (totalPages - 4) : 
                      i + (page - 2);
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          page === pageNum 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        page === totalPages 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md ${
                    page === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span>Siguiente</span>
                  <TbChevronRight className='text-lg' />
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