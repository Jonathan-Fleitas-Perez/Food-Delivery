import React from 'react'

const Tittle = ({title1,title2,titleStyles,paraStyle}) => {
  return (
    <div className={`${titleStyles} pb-1`}>
      <h2 className={`${titleStyles} h2`}>
        {title1}
        <span className='text-secondary !font-light'>{title2}</span>
      </h2>

      <p className={`${paraStyle} hidden`}>our food products are crafted with the finest ingredients to <br/> deliver exceptional taste and quality</p>
    </div>
  )
}

export default Tittle