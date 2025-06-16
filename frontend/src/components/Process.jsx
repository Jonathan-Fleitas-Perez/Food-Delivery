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
          <h4 className='h3 max-w-[411px] capitalize'>Order you favorite food in just a few clicks</h4>
          <p>Experience the convenience of ordering delicius meals anytime , anywhere. Follo these simple steps and have favorite food delivvered straight to your door</p>
         
          <div className='my-7 flex - flex-col gap-4'>
            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Explore a wide variety of dishes and cuisines</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Choose your favorite items and add them to your cart</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Enter your details and confirm your order with ease</p>
            </div>

            <div className='flexStart gap-x-4'> 
              <span className='bg-secondary text-white h-6 w-6 p-1.5 flexCenter rounded-full'><GiCheckMark/></span>
              <p>Stay update with real-time tracking until your food arrives</p>
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