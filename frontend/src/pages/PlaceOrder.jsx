import React, { useContext, useState } from 'react';
import CartTotal from '../components/CartTotal';
import Footer from '../components/Footer';
import Tittle from '../components/Tittle';
import { ShopConstest } from "../context/ShopContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';

const PlaceOrder = () => {
  const { navigate, backendUrl, cartItems, setCartItems, getCartAmount, foods, token } = useContext(ShopConstest);
  const [method, setMethod] = useState('cod');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    state: '',
    city: '',
    zipcode: '',
    country: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Esquema de validación con Zod
  const addressSchema = z.object({
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    email: z.string().email("Email inválido"),
    street: z.string().min(1, "Calle es requerida"),
    state: z.string().min(1, "Estado es requerido"),
    city: z.string().min(1, "Ciudad es requerida"),
    zipcode: z.string().min(1, "Código postal es requerido"),
    country: z.string().min(1, "País es requerido"),
    phone: z.string().min(6, "Teléfono debe tener al menos 6 caracteres")
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(data => ({ ...data, [name]: value }));
    
    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(errors => {
        const newErrors = { ...errors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      addressSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach(err => {
          const fieldName = err.path[0];
          errors[fieldName] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor complete todos los campos correctamente');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let orderItems = [];
      
      // Optimizado: Usar Object.entries para iterar más eficientemente
      for (const [itemId, sizes] of Object.entries(cartItems)) {
        for (const [size, quantity] of Object.entries(sizes)) {
          if (quantity > 0) {
            const itemInfo = foods.find(food => food._id === itemId);
            if (itemInfo) {
              // Crear copia superficial en lugar de estructurada (mejor performance)
              orderItems.push({
                ...itemInfo,
                size,
                quantity
              });
            }
          }
        }
      }

      // Validar que hay al menos un ítem en el carrito
      if (orderItems.length === 0) {
        toast.error('El carrito está vacío');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: Number(getCartAmount())
      };

      switch (method) {
        case 'cod': {
          const response = await axios.post(
            backendUrl + '/api/order/place', 
            orderData, 
            { headers: { token } }
          );
          
          if (response.data.success) {
            setCartItems({});
            toast.success('¡Orden creada con éxito!');
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case 'stripe': {
          const responseStripe = await axios.post(
            backendUrl + '/api/order/stripe', 
            orderData, 
            { headers: { token } }
          );
          
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error('Error al crear la orden:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para obtener clase de error
  const getInputClass = (fieldName) => {
    return formErrors[fieldName] 
      ? 'ring-1 ring-red-500 p-1 pl-3 rounded-sm bg-primary outline-none'
      : 'ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none';
  };

  return (
    <section className='mt-24 max-padd-container'>
      <form onSubmit={onSubmitHandler} className='py-6'>
        <div className='flex flex-col gap-20 xl:flex-row xl:gap-28'>
          <div className='flex flex-1 flex-col gap-3 text-[95%]'>
            {/* Información de Envío */}
            <Tittle title1={'Delivery'} title2={'information'} titleStyles={'h3'}/>

            <div className='flex gap-3'>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.firstName} 
                  type="text" 
                  name='firstName' 
                  placeholder='First Name *' 
                  className={getInputClass('firstName')}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.lastName} 
                  type="text" 
                  name='lastName' 
                  placeholder='Last Name *' 
                  className={getInputClass('lastName')}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <input 
                onChange={onChangeHandler} 
                value={formData.email} 
                type="email" 
                name='email' 
                placeholder='Email *' 
                className={getInputClass('email')}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <input 
                onChange={onChangeHandler} 
                value={formData.phone} 
                type="text" 
                name='phone' 
                placeholder='Phone Number *' 
                className={getInputClass('phone')}
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>
            
            <div>
              <input 
                onChange={onChangeHandler} 
                value={formData.street} 
                type="text" 
                name='street' 
                placeholder='Street *' 
                className={getInputClass('street')}
              />
              {formErrors.street && (
                <p className="mt-1 text-xs text-red-500">{formErrors.street}</p>
              )}
            </div>

            <div className='flex gap-3'>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.city} 
                  type="text" 
                  name='city' 
                  placeholder='City *' 
                  className={getInputClass('city')}
                />
                {formErrors.city && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
                )}
              </div>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.state} 
                  type="text" 
                  name='state' 
                  placeholder='State *' 
                  className={getInputClass('state')}
                />
                {formErrors.state && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.state}</p>
                )}
              </div>
            </div>

            <div className='flex gap-3'>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.zipcode} 
                  type="text" 
                  name='zipcode' 
                  placeholder='Zip Code *' 
                  className={getInputClass('zipcode')}
                />
                {formErrors.zipcode && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.zipcode}</p>
                )}
              </div>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.country} 
                  type="text" 
                  name='country' 
                  placeholder='Country *' 
                  className={getInputClass('country')}
                />
                {formErrors.country && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cart Total */}
          <div className='flex flex-col flex-1'>
            <CartTotal />
            
            {/* Métodos de Pago */}
            <div className='my-6'>
              <h3 className='mb-5 bold-20'>Payment <span className='text-secondary'>Method</span></h3>
              <div className='flex gap-3'>
                <button
                  type="button"
                  className={`${method === 'stripe' ? 'btn-secondary' : 'btn-light'} !p-1 text-xs cursor-pointer`}
                  onClick={() => setMethod('stripe')}
                >
                  Stripe
                </button>
                <button
                  type="button"
                  className={`${method === 'cod' ? 'btn-secondary' : 'btn-light'} !p-1 !px-3 text-xs cursor-pointer`}
                  onClick={() => setMethod('cod')}
                >
                  Cash on Delivery
                </button>
              </div>
            </div>
            
            <div>
              <button 
                type='submit' 
                className='btn-dark !rounded w-full flex justify-center items-center'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <Footer />
    </section>
  );
};

export default PlaceOrder;