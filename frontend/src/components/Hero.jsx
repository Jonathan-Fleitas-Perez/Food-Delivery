import React, { useState, useEffect, useContext } from 'react'
import { LuPizza} from 'react-icons/lu'
import {NavLink} from 'react-router-dom'
import {MdOutlineShareLocation} from 'react-icons/md'
import client1 from '../assets/client1.jpg'
import client2 from '../assets/client2.jpg'
import client3 from '../assets/client3.jpg'
import axios from 'axios'
import { ShopConstest } from '../context/ShopContext'

const Hero = () => {
  const { backendUrl } = useContext(ShopConstest)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/reviews/count`)
        if (data.success) {
          setReviewCount(data.total)
        }
      } catch (err) {
        console.error('Error cargando reseñas:', err)
      }
    }
    fetchReviews()
  }, [backendUrl])

  const formatCount = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <section className='mx-auto max-w-[1440px]'>
      <div className='relative bg-hero bg-cover bg-center bg-no-repeat h-[811px] w-full'>
        <div className='max-padd-container relative top-28 sm:top-36 md:top-72 text-white px-4'>
          <h1 className='h1 max-w-[44rem] capitalize text-3xl sm:text-4xl md:text-5xl'>Comida con sazón cubano directo <span className='text-secondary'>a tu puerta</span></h1>
          <p className='text-white regular-16 mt-6 max-w-[33rem] text-sm sm:text-base'>¡Asere, qué bolá! Bienvenido a Sudy's Food, donde el sabor criollo se encuentra con la calidad. Disfruta de la mejor comida típica cubana hecha con pasión y ese toquecito de la abuela. Desde unas buenas masitas de cerdo frita hasta la mejor ropita vieja de La Habana. ¡Déjanos quitarte el hambre con puro sabor!</p>
        
          <div className='flexStart !items-center gap-x-4 my-10'>
            <div className='flex relative'>
              <img src={client1} alt="" className='h-[36px] sm:h-[46px] shadow-sm rounded-full ' />
              <img src={client2} alt="" className='h-[36px] sm:h-[46px] shadow-sm rounded-full absolute left-6 sm:left-8' />
              <img src={client3} alt="" className='h-[36px] sm:h-[46px] shadow-sm rounded-full absolute left-12 sm:left-16' />
            </div>

            <div className='bold-16 sm:bold-24 ml-10 sm:ml-14 relative top-1'>
              {reviewCount > 0 ? formatCount(reviewCount) : '0'}  
              <span className='regular-16 sm:regular-20'> Reseñas</span>
            </div>
          </div>

          <div className='max-xs:flex-col flex gap-2'>
            <NavLink to={'/menu'} className={'btn-white flexCenter gap-x-2 text-sm sm:text-base'}> <LuPizza className='text-xl'/> Pedir Ahora</NavLink>
            <NavLink to={'/orders'} className={'btn-white flexCenter gap-x-2 text-sm sm:text-base'}> <MdOutlineShareLocation className='tet-xl'/> Mis Pedidos</NavLink>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero