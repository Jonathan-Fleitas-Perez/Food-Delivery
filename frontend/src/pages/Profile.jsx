import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopConstest } from '../context/ShopContext';
import { FaUserCircle, FaCamera } from 'react-icons/fa';

const Profile = () => {
    const { token, backendUrl, user, setUser } = useContext(ShopConstest);
    
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [municipalities, setMunicipalities] = useState([]);
    const [address, setAddress] = useState({
        province: 'La Habana',
        municipality: '',
        municipalityId: '',
        exactAddress: ''
    });
    
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar municipios
    useEffect(() => {
        const fetchMunicipalities = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/municipality/list`);
                if (response.data.success) {
                    setMunicipalities(response.data.data.filter(m => m.active));
                }
            } catch (error) {
                console.error('Error cargando municipios:', error);
            }
        };
        fetchMunicipalities();
    }, [backendUrl]);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            if (user.defaultDeliveryAddress) {
                setAddress({
                    province: user.defaultDeliveryAddress.province || 'La Habana',
                    municipality: user.defaultDeliveryAddress.municipality || '',
                    municipalityId: user.defaultDeliveryAddress.municipalityId || '',
                    exactAddress: user.defaultDeliveryAddress.exactAddress || ''
                });
            }
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMunicipalityChange = (e) => {
        const selected = municipalities.find(m => m._id === e.target.value);
        if (selected) {
            setAddress({ ...address, municipality: selected.name, municipalityId: selected._id });
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (password && password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (password && password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (password) formData.append('password', password);
            formData.append('address', JSON.stringify(address));
            if (image) formData.append('image', image);

            const { data } = await axios.put(`${backendUrl}/api/user/profile/update`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });

            if (data.success) {
                toast.success('Perfil actualizado correctamente');
                setUser(data.user);
                setPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div className="min-h-[60vh] flex items-center justify-center text-lg">Inicia sesión para ver tu perfil</div>;
    }

    return (
        <div className="max-padd-container pt-28 sm:pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-[#FFB800] p-6 sm:p-8 text-center relative">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mi Perfil</h2>
                    <p className="text-white/90 text-sm sm:text-base">Actualiza tu información y dirección de entrega</p>
                </div>

                <form onSubmit={onSubmitHandler} className="p-4 sm:p-8">
                    {/* Sección de Foto de Perfil */}
                    <div className="flex flex-col items-center mb-10 -mt-16 sm:-mt-20">
                        <div className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                hidden 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <label htmlFor="avatar-upload" className="block relative cursor-pointer">
                                {imagePreview || user?.avatar ? (
                                    <img 
                                        src={imagePreview || user.avatar} 
                                        alt="Foto de perfil" 
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                                    />
                                ) : (
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                        <FaUserCircle size={70} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaCamera className="text-white text-2xl" />
                                </div>
                            </label>
                        </div>
                        <span className="text-sm text-gray-500 mt-2">Toca para cambiar foto</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Información Básica */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Datos Personales</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm" 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre y apellidos"
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-200 text-gray-500 cursor-not-allowed text-sm" 
                                    type="email" 
                                    value={user?.email || ''}
                                    disabled 
                                />
                                <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                <input 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 8 carac. (Mayúsc, Núm.)" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                <input 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm" 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite tu nueva contraseña" 
                                />
                            </div>
                        </div>

                        {/* Dirección de Envío */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Dirección</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-00 mb-1">Provincia</label>
                                <input 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-200 text-gray-600 text-sm" 
                                    type="text" 
                                    value={address.province}
                                    disabled
                                    title="Actualmente solo repartimos en La Habana"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                                <select 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm" 
                                    value={address.municipalityId}
                                    onChange={handleMunicipalityChange}
                                >
                                    <option value="" disabled>Selecciona tu municipio</option>
                                    {municipalities.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Exacta</label>
                                <textarea 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none text-sm" 
                                    rows="3"
                                    value={address.exactAddress}
                                    onChange={(e) => setAddress({...address, exactAddress: e.target.value})}
                                    placeholder="Calle, No., Entre calles, Apto..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-6 sm:px-8 py-3 rounded-lg text-white font-bold transition-all shadow-md text-sm sm:text-base
                                ${loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-secondary hover:bg-secondary-dark hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
