import React, { useContext, useEffect, useState } from 'react'
import Tittle from './Tittle'
import { ShopConstest } from '../context/ShopContext';
import Item from './Item';

const PopularFoods = () => {
  const [popularFoods, setpopularFoods] = useState([]);
  const {foods} = useContext(ShopConstest);

  useEffect(() => {
    const data = [...foods].sort((a, b) => b.averageRating - a.averageRating);
    setpopularFoods(data.slice(0, 5));
  }, [foods]);

  return (
    <section className='max-padd-container py-16'>
      <Tittle title1={'Comidas'} title2={' Populares'} titleStyles={'text-center !pb-20'} paraStyle={'!block'}/>
      
      {/*COntainer */}
      <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-36 pt-20'>
        {popularFoods.map(food=>(
          <div key={food._id} >
              <Item food={food}/>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PopularFoods