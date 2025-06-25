import React, { useContext, useState, useRef, useEffect } from 'react'
import { FaStar, FaStarHalfStroke } from 'react-icons/fa6'
import { TbShoppingBagPlus } from 'react-icons/tb';
import { ShopConstest } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Item = ({ food }) => {
  const { currency, addToCart } = useContext(ShopConstest)
  const { token } = useContext(ShopConstest);
  const navigate = useNavigate();
  const [size, setSize] = useState(food.sizes[0]);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Observador de intersección para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!token) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }
    addToCart(food._id, size);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/placeholder-food.jpg';
    setImageLoaded(true);
  };

  return (
    <div 
      ref={itemRef} 
      className='relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col'
    >
      {/* Contenedor de imagen rediseñado */}
      <div className='flexCenter py-6 px-4 bg-white'>
        <div className={`relative w-[160px] h-[160px] ${!imageLoaded ? 'bg-gray-100 animate-pulse rounded-xl' : ''}`}>
          {isVisible && (
            <img 
              src={food.image} 
              alt={food.name} 
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </div>
      
      {/* Contenido de información */}
      <div className='px-4 pb-4 flex-grow flex flex-col'>
        {/* Título y descripción */}
        <div className='mb-3'>
          <h4 className='mb-1 font-bold text-base line-clamp-1'>{food.name}</h4>
          <div className='flex items-start justify-between pb-1'>
            <span className='text-sm text-gray-500'>{food.category}</span>
            <div className='flex items-center justify-start gap-x-1 text-yellow-500 font-bold text-sm'>
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStarHalfStroke />
              <span className='text-gray-600 ml-1'>4.5</span>
            </div>
          </div>
          <p className='line-clamp-3 text-gray-600 text-sm'>{food.description}</p>
        </div>

        {/* Selector de tamaño */}
        <div className='mt-auto mb-3'>
          <div className='flexBetween'>
            <div className='flex gap-1'>
              {[...food.sizes].sort((a, b) => {
                const order = ['S', 'M', 'L'];
                return order.indexOf(a) - order.indexOf(b);
              }).map((item, i) => (
                <button
                  onClick={() => setSize(item)}
                  key={i}
                  className={`${
                    item === size 
                      ? 'bg-secondary text-white border-2 border-secondary' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  } h-7 w-9 text-xs font-semibold rounded-md transition-colors`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddToCart}
              className='flexCenter gap-x-1 text-lg bg-secondary hover:bg-secondary-dark text-white rounded-full p-2 transition-colors shadow-md'
              aria-label="Agregar al carrito"
            >
              <TbShoppingBagPlus />
            </button>
          </div>
        </div>

        {/* Información de preparación y precio */}
        <div className='flexBetween rounded-lg bg-white p-3 text-sm font-medium'>
          <div className='flex flex-col items-center'>
            <span className='text-gray-500 text-xs'>Prep</span>
            <span className='font-bold'>5m</span>
          </div>
          
          <div className='h-6 w-px bg-gray-300'></div>
          
          <div className='flex flex-col items-center'>
            <span className='text-gray-500 text-xs'>Cook</span>
            <span className='font-bold'>20m</span>
          </div>
          
          <div className='h-6 w-px bg-gray-300'></div>
          
          <div className='flex flex-col items-center'>
            <span className='text-gray-500 text-xs'>Precio</span>
            <span className='font-bold text-secondary'>
              {currency}{food.price[size]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Item