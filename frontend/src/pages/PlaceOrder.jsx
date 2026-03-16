import React, { useContext, useState } from 'react';
import CartTotal from '../components/CartTotal';
import Footer from '../components/Footer';
import Tittle from '../components/Tittle';
import { ShopConstest } from "../context/ShopContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';

const PlaceOrder = () => {
  const { navigate, backendUrl, cartItems, setCartItems, user, foods, token, setDeliveryCharges, deliveryCharges, getUserProfile } = useContext(ShopConstest);
  const [municipalities, setMunicipalities] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    province: 'La Habana',
    municipality: '',
    exactAddress: '',
  });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar Municipios y Pre-llenado inicial
  React.useEffect(() => {
    const fetchMunicipalities = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/municipality/list`);
            if (response.data.success) {
                const activeMunicipalities = response.data.data.filter(m => m.active);
                setMunicipalities(activeMunicipalities);
            }
        } catch (error) {
            console.error('Error cargando municipios:', error);
        }
    };
    fetchMunicipalities();
  }, [backendUrl]);

  // Si el usuario tiene información guardada, pre-llenar SOLO una vez al cargar el componente
  // o cuando el objeto user esté disponible por primera vez.
  React.useEffect(() => {
     if (user && !formData.firstName && !formData.lastName) {
         setFormData(prev => ({
             ...prev,
             firstName: user.name ? user.name.split(' ')[0] : '',
             lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
             municipality: user.defaultDeliveryAddress?.municipality || '',
             exactAddress: user.defaultDeliveryAddress?.exactAddress || ''
         }));
     }
  }, [user, formData.firstName, formData.lastName]);

  // Actualizar costo de envío al cambiar el municipio
  React.useEffect(() => {
     if (formData.municipality && municipalities.length > 0) {
         const selectedMun = municipalities.find(m => m.name === formData.municipality);
         if (selectedMun) {
             setDeliveryCharges(selectedMun.deliveryFee);
         } else {
             setDeliveryCharges(0);
         }
     } else {
         setDeliveryCharges(0);
     }
  }, [formData.municipality, municipalities, setDeliveryCharges]);

  // Esquema de validación con Zod
  const addressSchema = z.object({
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    province: z.string().min(1, "Provincia requerida"),
    municipality: z.string().min(1, "Selecciona un municipio"),
    exactAddress: z.string().min(5, "Dirección exacta demasiado corta")
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
  
  if (!validateForm()) {
    toast.error('Por favor complete todos los campos correctamente');
    return;
  }
  
  setIsSubmitting(true);

  try {
    // Si el usuario marcó guardar en el perfil
    if (saveToProfile) {
      const profileData = new FormData();
      // Si el nombre cambió, lo enviamos. Si no, mantenemos el actual.
      profileData.append('name', `${formData.firstName} ${formData.lastName}`);
      profileData.append('address', JSON.stringify({
        province: formData.province,
        municipality: formData.municipality,
        exactAddress: formData.exactAddress
      }));

      await axios.put(`${backendUrl}/api/user/profile/update`, profileData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'token': token // Por si acaso el middleware usa este header
        }
      });
      // Importante: Actualizar el contexto con los nuevos datos
      if (typeof getUserProfile === 'function') {
        await getUserProfile(token);
      }
    }

    let orderItems = [];
    let totalAmount = 0;
    
    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (quantity > 0) {
        const itemInfo = foods.find(food => food._id === itemId);
        if (itemInfo) {
          const price = itemInfo.price;
          totalAmount += price * quantity;
          
          orderItems.push({
            name: itemInfo.name,
            quantity,
            price: Number(price)
          });
        }
      }
    }

    if (orderItems.length === 0) {
      toast.error('El carrito está vacío');
      setIsSubmitting(false);
      return;
    }

    totalAmount = Number(totalAmount.toFixed(2));
    const totalConEnvio = totalAmount + deliveryCharges;
    
    // Guardar orden en BD
    const orderData = {
      userId: user.id,
      address: formData,
      items: orderItems,
      amount: totalConEnvio,
      paymentMethod: 'WhatsApp'
    };

    const response = await axios.post(
      backendUrl + '/api/order/place', 
      orderData, 
      { headers: { token } }
    );
    
    if (response.data.success) {
      // Construir mensaje de WhatsApp
      let msg = `🍔 *Nuevo Pedido - Sudy's Food*\n\n`;
      msg += `👤 *Cliente:* ${formData.firstName} ${formData.lastName}\n`;
      msg += `📍 *Dirección:* ${formData.municipality}, ${formData.exactAddress}\n\n`;
      msg += `📋 *Productos:*\n`;
      orderItems.forEach(item => {
        msg += `  - ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      msg += `\n💰 Subtotal: $${totalAmount.toFixed(2)}`;
      msg += `\n🚚 Envío (${formData.municipality}): $${deliveryCharges}`;
      msg += `\n💵 *Total: $${totalConEnvio.toFixed(2)}*`;
      
      const waUrl = `https://wa.me/5352375485?text=${encodeURIComponent(msg)}`;
      
      setCartItems({});
      toast.success('¡Pedido enviado! Te redirigimos a WhatsApp.');
      
      window.open(waUrl, '_blank');
      navigate('/orders');
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error('Error al crear la orden:', error);
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      toast.error(error.response?.data?.message || 'Error al procesar la orden');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Función para obtener clase de error
  const getInputClass = (fieldName) => {
    return formErrors[fieldName] 
      ? 'ring-1 ring-red-500 p-2 pl-3 rounded-sm bg-primary outline-none w-full'
      : 'ring-1 ring-slate-900/15 p-2 pl-3 rounded-sm bg-primary outline-none w-full';
  };

  return (
    <section className='mt-24 max-padd-container'>
      <form onSubmit={onSubmitHandler} className='py-6'>
        <div className='flex flex-col gap-10 xl:flex-row xl:gap-28'>
          <div className='flex flex-1 flex-col gap-5 text-[95%]'>
            {/* Información de Envío */}
            <Tittle title1={'Dirección'} title2={' Entrega'} titleStyles={'h3'}/>

            <div className='flex flex-col sm:flex-row gap-3'>
              <div className="flex-1">
                <input 
                  onChange={onChangeHandler} 
                  value={formData.firstName} 
                  type="text" 
                  name='firstName' 
                  placeholder='Nombre *' 
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
                  placeholder='Apellidos *' 
                  className={getInputClass('lastName')}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className='flex flex-col sm:flex-row gap-3'>
                <div className="flex-1">
                  <input 
                    value={formData.province} 
                    disabled
                    type="text" 
                    title="Operamos solamente en La Habana"
                    name='province' 
                    className={`bg-gray-100 text-gray-500 cursor-not-allowed ${getInputClass('province')}`}
                  />
                </div>
                <div className="flex-1">
                  <select 
                    onChange={onChangeHandler} 
                    value={formData.municipality} 
                    name='municipality' 
                    className={`${getInputClass('municipality')} w-full text-gray-700`}
                  >
                     <option value="" disabled>Selecciona tu Municipio *</option>
                     {municipalities.map(m => (
                         <option key={m._id} value={m.name}>{m.name} - ${m.deliveryFee}</option>
                     ))}
                  </select>
                  {formErrors.municipality && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.municipality}</p>
                  )}
                </div>
            </div>

            <div>
              <textarea 
                onChange={onChangeHandler} 
                value={formData.exactAddress} 
                name='exactAddress' 
                rows="3"
                placeholder='Dirección Exacta (Calle, No., Entre qué calles, Apto...) *' 
                className={`resize-none ${getInputClass('exactAddress')} w-full`}
              />
              {formErrors.exactAddress && (
                <p className="mt-1 text-xs text-red-500">{formErrors.exactAddress}</p>
              )}
            </div>

            {/* Checkbox informativo de guardar cambios - Siempre visible si hay cambios o si no hay dirección */}
            <div className='flex items-center gap-2 mt-2 bg-secondary/5 p-3 rounded-lg border border-secondary/10'>
                <input 
                  type="checkbox" 
                  id="saveToProfile" 
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className='accent-secondary h-4 w-4 cursor-pointer'
                />
                <label htmlFor="saveToProfile" className='text-sm text-gray-600 cursor-pointer select-none'>
                  ¿Deseas guardar estos datos en tu perfil para futuros pedidos?
                </label>
              </div>
          </div>

          {/* Cart Total */}
          <div className='flex flex-col flex-1 gap-6'>
            <CartTotal />
            
            <div className='p-4 bg-secondary/10 rounded-xl border border-secondary/10'>
              <p className='text-sm text-gray-600'>
                El pago se gestiona directamente por WhatsApp con nuestro equipo al recibir tu pedido.
              </p>
            </div>
            
            <div>
              <button 
                type='submit' 
                className='btn-dark !rounded-lg w-full flex justify-center items-center py-4 text-lg font-bold'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : 'Confirmar Pedido vía WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default PlaceOrder;