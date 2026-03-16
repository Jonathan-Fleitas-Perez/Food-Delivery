import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

const Municipalities = ({ url }) => {
    const [municipalities, setMunicipalities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [id, setId] = useState(null);
    const [name, setName] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [active, setActive] = useState(true);

    const fetchMunicipalities = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/municipality/list`);
            if (response.data.success) {
                setMunicipalities(response.data.data);
            } else {
                toast.error('Error al cargar municipios');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error del servidor al cargar municipios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMunicipalities();
    }, []);

    const resetForm = () => {
        setId(null);
        setName('');
        setDeliveryFee('');
        setActive(true);
        setShowForm(false);
    };

    const handleEdit = (mun) => {
        setId(mun._id);
        setName(mun.name);
        setDeliveryFee(mun.deliveryFee);
        setActive(mun.active);
        setShowForm(true);
    };

    const handleDelete = async (deleteId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este municipio?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${backendUrl}/api/municipality/${deleteId}`, {
                headers: { 'token': token }
            });
            if (response.data.success) {
                toast.success('Municipio eliminado');
                fetchMunicipalities();
            } else {
                toast.error('Error al eliminar');
            }
        } catch (error) {
            toast.error('Error del servidor: ' + (error.response?.data?.message || 'Permiso denegado'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || deliveryFee === '') {
            toast.error('Completa los campos requeridos');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const data = { name, deliveryFee: Number(deliveryFee), active };
            
            let response;
            if (id) {
                // Update
                response = await axios.put(`${backendUrl}/api/municipality/${id}`, data, {
                    headers: { 'token': token }
                });
            } else {
                // Add
                response = await axios.post(`${backendUrl}/api/municipality/add`, data, {
                    headers: { 'token': token }
                });
            }

            if (response.data.success) {
                toast.success(id ? 'Municipio actualizado' : 'Municipio agregado');
                resetForm();
                fetchMunicipalities();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error al guardar: ' + (error.response?.data?.message || 'Permiso denegado'));
        }
    };

    return (
        <div className='p-4 sm:p-10 box-border w-full h-full overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
                <h4 className='bold-22 text-gray-800'>Zonas de Entrega (Municipios)</h4>
                <button 
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className='bg-secondary text-white px-4 py-2 rounded flex items-center gap-2 font-medium hover:bg-secondary-dark transition-colors'
                >
                    {showForm ? <><FaTimes /> Cancelar</> : <><FaPlus /> Añadir Nuevo</>}
                </button>
            </div>

            {showForm && (
                <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-2xl animate-fadeIn'>
                    <h5 className='bold-18 mb-4 border-b pb-2'>{id ? 'Editar Municipio' : 'Añadir Nuevo Municipio'}</h5>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre del Municipio</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none'
                                placeholder="Ej: Playa, Plaza, Centro Habana"
                                required 
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Costo de Entrega ($)</label>
                            <input 
                                type="number" 
                                value={deliveryFee} 
                                onChange={(e) => setDeliveryFee(e.target.value)} 
                                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none'
                                min="0" 
                                step="1" 
                                placeholder="Costo en CUP o USD según tu moneda base"
                                required 
                            />
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                            <input 
                                type="checkbox" 
                                id="activeCheck"
                                checked={active} 
                                onChange={(e) => setActive(e.target.checked)} 
                                className='w-4 h-4 text-secondary rounded focus:ring-secondary border-gray-300'
                            />
                            <label htmlFor="activeCheck" className='text-sm text-gray-700 cursor-pointer'>
                                Zona Activa (Disponible para pedir)
                            </label>
                        </div>
                        <div className='pt-4'>
                            <button type="submit" className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors w-full sm:w-auto'>
                                Guardar Municipio
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left border-collapse'>
                        <thead>
                            <tr className='bg-gray-50 border-b border-gray-200 text-gray-600 font-medium text-sm'>
                                <th className='p-4'>Nombre</th>
                                <th className='p-4 w-32'>Costo</th>
                                <th className='p-4 w-24 text-center'>Estado</th>
                                <th className='p-4 w-28 text-center'>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className='text-center p-8 text-gray-500'>Cargando municipios...</td>
                                </tr>
                            ) : municipalities.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className='text-center p-8 text-gray-500'>No hay municipios configurados. Añade uno para empezar.</td>
                                </tr>
                            ) : (
                                municipalities.map((mun) => (
                                    <tr key={mun._id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0'>
                                        <td className='p-4 font-medium text-gray-800'>{mun.name}</td>
                                        <td className='p-4 text-gray-600'>${mun.deliveryFee}</td>
                                        <td className='p-4 text-center'>
                                            {mun.active ? (
                                                <span className='inline-flex items-center gap-1 bg-green-100 text-green-700 font-medium text-xs px-2 py-1 rounded-full'>
                                                    <FaCheck size={10} /> Activo
                                                </span>
                                            ) : (
                                                <span className='inline-flex items-center gap-1 bg-gray-100 text-gray-600 font-medium text-xs px-2 py-1 rounded-full'>
                                                    <FaTimes size={10} /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className='p-4 flex gap-2 justify-center'>
                                            <button 
                                                onClick={() => handleEdit(mun)}
                                                className='p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(mun._id)}
                                                className='p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors'
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Municipalities;
