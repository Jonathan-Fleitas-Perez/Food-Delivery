import React, { useContext, useEffect, useState } from 'react';
import { ShopConstest } from '../context/ShopContext';
import Tittle from './Tittle';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const Testimonials = () => {
    const { foods } = useContext(ShopConstest);
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(3);

    useEffect(() => {
        // Handle responsiveness for number of items to show
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsToShow(1);
            else if (window.innerWidth < 1024) setItemsToShow(2);
            else setItemsToShow(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Collect all ratings from all foods
        const allRatings = [];
        foods.forEach(food => {
            if (food.ratings && food.ratings.length > 0) {
                food.ratings.forEach(rating => {
                    if (rating.rating >= 4) {
                        allRatings.push({
                            ...rating,
                            foodName: food.name,
                            // If userId is populated, we get the avatar
                            userAvatar: rating.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rating.userName || 'default'}`
                        });
                    }
                });
            }
        });

        // Sort by rating and date
        const sorted = allRatings.sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
        setTestimonials(sorted.slice(0, 12)); // Take up to 12 top testimonials
    }, [foods]);

    useEffect(() => {
        if (testimonials.length > itemsToShow) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % (testimonials.length - itemsToShow + 1));
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [testimonials, itemsToShow]);

    if (testimonials.length === 0) return null;

    return (
        <section className='max-padd-container py-16 bg-primary/30 rounded-3xl my-16'>
            <Tittle title1={'Opiniones de'} title2={' Clientes'} titleStyles={'text-center'} paraStyle={'!block'} />
            
            <div className='relative max-w-7xl mx-auto mt-12 overflow-hidden px-4'>
                <div 
                    className='flex transition-transform duration-700 ease-in-out'
                    style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className='flex-shrink-0 px-4' style={{ width: `${100 / itemsToShow}%` }}>
                            <div className='bg-white p-8 rounded-2xl shadow-sm border border-secondary/10 relative h-full flex flex-col'>
                                <FaQuoteLeft className='text-secondary/10 text-4xl absolute top-4 left-4' />
                                <div className='flex flex-col items-center text-center flex-1'>
                                    <img 
                                        src={testimonial.userAvatar} 
                                        alt={testimonial.userName} 
                                        className='w-20 h-20 rounded-full object-cover mb-4 border-2 border-secondary/20 p-1 bg-white shadow-sm'
                                    />
                                    <div className='flex gap-1 mb-3'>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar 
                                                key={i} 
                                                className={i < testimonial.rating ? 'text-yellow-500' : 'text-gray-200'}
                                                size={14}
                                            />
                                        ))}
                                    </div>
                                    <p className='text-gray-600 italic mb-6 text-base line-clamp-3'>
                                        "{testimonial.comment || '¡El servicio fue increíble y la comida deliciosa!'}"
                                    </p>
                                </div>
                                <div className='border-t border-gray-100 pt-4 mt-auto'>
                                    <h4 className='font-bold text-lg'>{testimonial.userName || 'Cliente'}</h4>
                                    <p className='text-secondary text-xs font-semibold uppercase tracking-wider'>
                                        {testimonial.foodName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Dots */}
                <div className='flex justify-center gap-2 mt-10'>
                    {[...Array(Math.max(0, testimonials.length - itemsToShow + 1))].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentIndex === index ? 'bg-secondary w-8' : 'bg-secondary/20 w-2'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
