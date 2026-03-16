import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaCloudUploadAlt } from 'react-icons/fa';

const Offers = ({ token }) => {
    const [offers, setOffers] = useState([]);
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchOffers = React.useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/offer/admin/list`, { headers: { token } });
            if (response.data.success) {
                setOffers(response.data.offers);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }, [token]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image) return toast.error("Seleccione una imagen");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", image);

            const response = await axios.post(`${backendUrl}/api/offer/add`, formData, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                setImage(false);
                fetchOffers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeOffer = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar esta oferta?")) return;
        try {
            const response = await axios.delete(`${backendUrl}/api/offer/${id}`, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchOffers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await axios.put(`${backendUrl}/api/offer/${id}/toggle`, { active: !currentStatus }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchOffers();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    return (
        <div className='p-4 sm:p-8 bg-white rounded-2xl shadow-sm'>
            <h2 className='h3 mb-8'>Gestión de Ofertas</h2>
            
            <div className='bg-primary/10 p-4 rounded-xl mb-8 border border-secondary/20'>
                <p className='text-sm text-gray-600'>
                    <strong>Importante:</strong> Puede haber un máximo de <strong>2 ofertas</strong> activas. 
                    Recomendamos imágenes con dimensiones de aproximadamente <strong>1440x400px</strong> para un mejor ajuste en la landing page.
                </p>
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-y-4 mb-12 max-w-xl'>
                <p className='medium-16'>Subir nueva oferta</p>
                <div className='flex items-center gap-4'>
                    <label htmlFor="image" className='cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all w-40 h-40 bg-gray-50'>
                        {image ? (
                            <img src={URL.createObjectURL(image)} alt="" className='w-full h-full object-cover rounded-lg' />
                        ) : (
                            <>
                                <FaCloudUploadAlt className='text-4xl text-gray-400' />
                                <span className='text-xs text-gray-400 mt-2 text-center'>Seleccionar imagen</span>
                            </>
                        )}
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                    <div className='flex flex-col gap-2'>
                        <button disabled={loading} type='submit' className='btn-dark flexCenter gap-2 py-3 px-8 rounded-xl'>
                            {loading ? 'Subiendo...' : <><FaPlus /> Añadir Oferta</>}
                        </button>
                        {image && (
                           <button type='button' onClick={()=>setImage(false)} className='text-sm text-red-500 underline'>Cancelar</button>
                        )}
                    </div>
                </div>
            </form>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {offers.map((offer) => (
                    <div key={offer._id} className='border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative'>
                        <img src={offer.image} alt="" className='w-full aspect-[16/5] object-cover' />
                        <div className='p-4 flex justify-between items-center bg-white'>
                            <div className='flex items-center gap-3'>
                                <span className={`w-3 h-3 rounded-full ${offer.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className='text-sm font-medium'>{offer.active ? 'Activa' : 'Inactiva'}</span>
                            </div>
                            <div className='flex gap-3'>
                                <button 
                                    onClick={() => toggleStatus(offer._id, offer.active)}
                                    className='text-xs px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all'
                                >
                                    {offer.active ? 'Desactivar' : 'Activar'}
                                </button>
                                <button 
                                    onClick={() => removeOffer(offer._id)}
                                    className='text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all'
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {offers.length === 0 && (
                <div className='text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
                    <p className='text-gray-400'>No hay ofertas creadas aún.</p>
                </div>
            )}
        </div>
    );
};

export default Offers;
