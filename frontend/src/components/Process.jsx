import React from 'react'
import {GiCheckMark} from 'react-icons/gi'
import procces1 from '../assets/process1.jpg'
import procces2 from '../assets/process2.jpg'

const Process = () => {
  return (
    <section className='max-padd-container py-16 xl:py-20'>
      {/*Container */}
      <div className='flex flex-col gap-20 xl:flex-row'>
        {/*left side */}
        <div className='flex-1 flex flex-col justify-center'>
          <h4 className='h3 max-w-[411px] capitalize'>Pide tu comida favorita en solo unos clics</h4>
          <p>Experimenta la comodidad de pedir comidas deliciosas en cualquier momento y lugar. Sigue estos sencillos pasos y recibe tu comida favorita directamente en tu puerta</p>
         
          <div className='my-7 flex - flex-col gap-4'>
            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Explora una amplia variedad de platos y cocinas</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Elige tus platos favoritos y añádelos a tu carrito</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Introduce tus datos y confirma tu pedido fácilmente</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Mantente informado con el seguimiento en tiempo real hasta que llegue tu comida</p>
            </div>

          </div>
        </div>

        {/*right side */}
        <div className='flex-1 flex gap-6 xl:gap-12'>
          <div>
            <img src={procces1} alt="imagen de comida" className='rounded-xl'/>
          </div>
          
          <div className='relative top-8'>
            <img src={procces2} alt="imagen de comida" className='rounded-xl'/>
          </div>
        </div>

      </div>

    </section>
  )
}

export default Process