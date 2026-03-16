import React from 'react'

const Tittle = ({title1,title2,titleStyles,paraStyle}) => {
  return (
    <div className={`${titleStyles} pb-1`}>
      <h2 className={`${titleStyles} h2`}>
        {title1}
        <span className='text-secondary !font-light'>{title2}</span>
      </h2>

      <p className={`${paraStyle} hidden`}>Nuestros platillos están elaborados con los ingredientes más finos para <br/> ofrecer un sabor y calidad excepcionales</p>
    </div>
  )
}

export default Tittle