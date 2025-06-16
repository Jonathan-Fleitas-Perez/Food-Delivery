import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { TbTrash } from 'react-icons/tb'

const List = ({token}) => {
  const [list,setList] = useState([])

  const fetchList = async ()=>{
    try {
      const response = await axios.get(backendUrl+'/api/product/list')
      
      if(response.data.success)
        setList(response.data.products)
      else
        toast.error(response.data.message) 
   
      } catch (error) {
      console.log(error.message) 
      toast.error(error.message)
    }
  }


  const removeProduct = async(id)=>{
    try {
      const response = await axios.post(backendUrl+'/api/product/remove',{id},{headers:{token}})
      
      if(response.data.succes){
        toast.success(response.data.message)
        await fetchList()
      }        
      else
        toast.error('Error al eliminar producto',response.data.message)


    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  useEffect(()=>{
    fetchList()
  },[])
  
  return (
    <div className='px-2 sm:px-8'>
      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 bg-white bold-14 sm:bold-15 rounded'>
          <h5>Image</h5>
          <h5>Name</h5>
          <h5>Category</h5>
          <h5>Price</h5>
          <h5>Remove</h5>
        </div>

        {/**Food List */}
        {list.map((item)=>(
          <div key={item._id} className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 p-1 bg-white rounded-xl'>
              <img src={item.image} alt={item.name} className='w-12 rounded-xl'/>
              <h5 className='text-sm font-semibold'>{item.name}</h5>
              <p className='font-semibold'>{item.category}</p>
              <div className='text-sm font-semibold'>{currency}{Object.values(item.price)[0]}</div>
              <div><TbTrash onClick={(item)=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'/></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default List