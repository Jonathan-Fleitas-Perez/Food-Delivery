import React from 'react'
import coverBanner1 from '../assets/cover-banner-1.jpg'
import coverBanner2 from '../assets/cover-banner-2.jpg'

const Promo = () => {
  return (
    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-7 py-12 ">
        <div><img src={coverBanner1} alt="Promocion de el restaurante" className="md:rounded-e-2xl"/></div>
        <div><img src={coverBanner2} alt="Promocion de el restaurante" className="md:rounded-s-2xl"/></div>
      </div>
  )
}

export default Promo