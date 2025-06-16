import React, { useState } from 'react'
import upload_icon from '../assets/upload_icon.png'
import axios from 'axios'
import {TbTrash} from 'react-icons/tb'
import {FaPlus} from 'react-icons/fa6'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prices, setPrices] = useState([])
  const [category, setCategory] = useState('Curry')
  const [popular, setPopular] = useState(false)


  const handleImageChange = (e)=>{
    setImage(e.target.files[0])
  }

  const addSizePrice = () =>{
    setPrices([...prices,{size:'',price:''}])
  }

  const handleSizePriceChange =(index,field,value)=>{
    const updatePrices = prices.map((item,i)=> i === index ? {...item,[field]:field==='size'? value.toUpperCase():value}:item)
    setPrices(updatePrices)
  }

  const removeSizePrice =(index)=>{
    setPrices(prices.filter((_,i)=>i!==index))
  }

  const onSubmitHandler = async (e)=>{
    e.preventDefault()
    try {
      if (!image)  toast.error("Debes subir una imagen");
      const formData = new FormData()

      formData.append('name',name)
      formData.append('description',description)
      formData.append('prices',JSON.stringify(prices))
      formData.append('category',category)
      formData.append('popular',popular)
      formData.append('image',image)
      
      console.log(JSON.stringify(prices))
      const response = await axios.post(`${backendUrl}/api/product/add`,formData,{headers:{token}})
      if(response.data.success){
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setPrices([])
        setImage(null)
        setPopular(false)
      }else
        toast.error(response.data.message)

      console.log(...formData.entries())

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className='px-2 sm:px-8'>
      <form className='flex flex-col gap-y-3 medium-14 lg:w-[777px]' onSubmit={onSubmitHandler}>
        <div className='w-full'>
          <h5 className='h5'>Product Name</h5>
          <input type="text" placeholder='Write Here' onChange={(e)=>setName(e.target.value)} value={name} className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>

        <div className='w-full'>
          <h5 className='h5'>Product Description</h5>
          <textarea rows={5} placeholder='Write Here' onChange={(e)=>setDescription(e.target.value)} value={description} className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg' />
        </div>

        {/*Categories*/}
        <div className='flex items-end gap-x-6'>
          <div>
            <h5 className='h5'>Category</h5>
            <select onChange={(e)=>setCategory(e.target.value)} value={category} className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 sm:w-full text-gray-30'>
              <option value="Curry">Curry</option>
              <option value="Pizza">Pizza</option>
              <option value="Rice">Rice</option>
              <option value="Deserts">Deserts</option>
              <option value="Drinks">Drinks</option>
              <option value="Fruits">Fruits</option>
            </select>
          </div>

          <div className='flex gap-2 pt-2'>
            <label htmlFor="image">
              <img src={image ? URL.createObjectURL(image):upload_icon} alt="image" className='w-14 h-14 aspect-square object-cover ring-1 ring-slate-900/5 bg-white rounded-lg'/>
              <input type="file" onChange={handleImageChange} name='image' id='image' hidden />
            </label>
          </div>
        </div>

        {/*Sizes */}
        <div >
          <h5 className='h5'>Sizes and Pricing</h5>
          {prices.map((item,index)=>(
            <div key={index} className='flex items-end gap-4 mt-2'>
              <input onChange={(e)=>handleSizePriceChange(index,'size',e.target.value)} value={item.size} type="text" placeholder='(S, M, L)' className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white w-20'/>
              <input onChange={(e)=>handleSizePriceChange(index,'price',e.target.value)} value={item.price} type="number" placeholder='Price' min={0} className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white w-20'/>
              <button onClick={()=>removeSizePrice(index)} type='button' className='text-red-500 !p-2 text-xl'><TbTrash/></button>
            </div>
          ))}

          <button onClick={addSizePrice} className='btn-secondary !rounded !text-xs flexCenter gap-x-2 mt-4 !px-3 !py-1'> <FaPlus/> Add Sizing</button>
        </div>

        <div className='flexStart gap-2 my-2'>
          <input onChange={()=>setPopular((prev)=>!prev)} value={popular} type="checkbox" checked={popular} id='popular' />
          <label htmlFor="popular" className='cursor-pointer'>Add to popular</label>
        </div>
        <button type='submit' className='btn-dark !rounded mt-3 max-w-44 sm:w-full'>Add Product</button>
      </form>
    </div>
  )
}

export default Add