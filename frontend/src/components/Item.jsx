import React, { useContext, useState } from 'react'
import { FaStar, FaStarHalfStroke } from 'react-icons/fa6'
import { TbShoppingBagPlus } from 'react-icons/tb';
import { ShopConstest } from '../context/ShopContext';

const Item = ({food}) => {
  const {currency ,addToCart} = useContext(ShopConstest)
  const [size, setsize] = useState(food.sizes[0]);

  return (
    <div className='relative bg-white rounded-xl'>
      {/*Photo */}
      <div className='flexCenter m-6 rounded-full absolute left-0 right-0 -top-[111px]'>
        <img src={food.image} alt={food.name} height={177} width={177} className='object-contain aspect-square rounded-xl' />
      </div>
      {/*Info*/}
      <div className='pt-20 mx-4 bg-white'>
        {/*titulo y descripcion */}
        <div className='py-3'>
          <h4 className='mb-1 bold-16 line-clamp-1'>{food.name}</h4>
          <div className='flex items-start justify-between pb-1'>
            <h5 className='mb-1 medium-14'>{food.category}</h5>
            <div className='flex items-center justify-start gap-x-1 text-secondary bold-14'>
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStarHalfStroke />
              <span className='text-tertiary'>4.5</span>
            </div>
          </div>
          <p className='line-clamp-3'>{food.description}</p>
        </div>

        {/*food size*/}
        <div className='mb-2 flexBetween'>
          <div className='flex gap-1'>
            {[...food.sizes].sort((a,b)=>{
              const order = ["H",'F','S','M','L','XL'];
              return order.indexOf(a)- order.indexOf(b)
            }).map((item,i)=>(
              <button onClick={()=>setsize(item)}  key={i} className={`${item === size ?'ring-1 ring-slate-900/10':''} h-6 w-8 bg-primary text-xs font-semibold rounded-sm`}>
                  {item}
              </button>
            ))}
          </div>
          <button onClick={()=>addToCart(food._id,size)} className='flexCenter gap-x-1 text-[18px] bg-secondary text-white rounded-sm p-[3px]'>
            <TbShoppingBagPlus/>
          </button>
        </div>

        {/*orderr info */}
            <div className='flexBetween rounded-xl pb-3 text-[13px] font-semibold'>
              <div className='flex flex-col gap-1'>
                <h5>Prep</h5>
                <p className='text-xs'>5m</p>
              </div>
              <hr className='h-8 w-[1px] bg-tertiary/10 border-none'/>

              <div className='flex flex-col gap-1'>
                <h5>Cook</h5>
                <p className='text-xs'>20m</p>
              </div>
              <hr className='h-8 w-[1px] bg-tertiary/10 border-none'/>

              <div className='flex flex-col gap-1'>
                <h5>Price</h5>
                <p className='text-xs text-secondary'>
                  {currency}{food.price[size]}
                </p>
              </div>
              
            </div>

      </div>
    </div>
  )
}

export default Item