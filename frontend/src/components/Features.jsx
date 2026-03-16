import React from 'react'
import shipping from '../assets/shipping-fast.svg'
import hot from '../assets/hot-food.svg'
import fresh from '../assets/fresh-food.svg'
import hat from '../assets/hat-chef.svg'

const Features = () => {
  return (
    <section className='max-padd-container py-16 xl:py-28 !pb-12'>
      <div className='max-padd-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-12'>
        <div className='flexCenter flex-col gap-3'>
          <img src={shipping} alt="icono de carro" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Entrega Volando</h5>
            <hr  className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Te llevamos el pedido echando humo, con un servicio rápido y seguro</p>
        </div>


        <div className='flexCenter flex-col gap-3'>
          <img src={hot} alt="icono de parrila" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Recién Hechecito</h5>
            <hr  className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Disfruta tu comida calientita, como recién sacada del fogón</p>
        </div>


        <div className='flexCenter flex-col gap-3'>
          <img src={fresh} alt="icono de carro" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Ingredientes Frescos</h5>
            <hr  className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Usamos viandas y carnes fresquecitas del agro todos los días</p>
        </div>


        <div className='flexCenter flex-col gap-3'>
          <img src={hat} alt="icono de carro" height={44} width={44} />
          <div className='flexCenter flex-col'>
            <h5 className='h5'>Sazón Garantizada</h5>
            <hr  className='w-8 bg-secondary h-1 rounded-full border-none'/>
          </div>
          <p className='text-center'>Nuestros cocineros le ponen ese toque criollo que no falla en cada plato</p>
        </div>


      </div>
    </section>
  )
}

export default Features