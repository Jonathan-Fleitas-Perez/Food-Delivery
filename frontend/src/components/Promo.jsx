import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopConstest } from '../context/ShopContext'

const Promo = () => {
    const { backendUrl } = useContext(ShopConstest);
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/offer/list`);
                if (response.data.success) {
                    setOffers(response.data.offers);
                }
            } catch (error) {
                console.error("Error fetching offers:", error);
            }
        };
        fetchOffers();
    }, [backendUrl]);

    if (offers.length === 0) return null;

    return (
        <div className={`max-w-[1440px] mx-auto flex flex-col md:flex-row gap-7 py-12 ${offers.length === 1 ? 'justify-center' : ''}`}>
            {offers.map((offer, index) => (
                <div key={offer._id} className={`${offers.length === 1 ? 'w-full md:w-3/4' : 'flex-1'}`}>
                    <img 
                        src={offer.image} 
                        alt="Promoción del restaurante" 
                        className={`w-full h-auto object-cover shadow-sm ${
                            offers.length === 1 
                                ? 'md:rounded-2xl' 
                                : index === 0 
                                    ? 'md:rounded-e-2xl' 
                                    : 'md:rounded-s-2xl'
                        }`} 
                    />
                </div>
            ))}
        </div>
    )
}

export default Promo