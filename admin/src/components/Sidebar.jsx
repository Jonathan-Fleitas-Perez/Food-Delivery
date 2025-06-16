import React from 'react'
import { NavLink } from 'react-router-dom'
import {FaSquarePlus} from 'react-icons/fa6'
import {FaListAlt} from 'react-icons/fa'
import {MdFactCheck} from 'react-icons/md'
import {BiLogOut} from 'react-icons/bi'

const Sidebar = ({token,settoken}) => {
  return (
    <div className='max-sm:flexCenter max-xs:pb-3 rounded bg-white pb-3 sm:w-1/5 sm:min-h-screen'>
        <div className='flex max-sm:items-center sm:flex-col pt-5'>
            <div className='flex sm:flex-col gap-x-5 gap-y-8 sm:pt-10'>
                <NavLink to={'/'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                    <FaSquarePlus />
                    <div className='hidden lg:flex'>Add Items</div>
                </NavLink>
               
                <NavLink to={'/list'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                    <FaListAlt/>
                    <div className='hidden lg:flex'>List Items</div>
                </NavLink>
               
                <NavLink to={'/orders'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                    <MdFactCheck/>
                    <div className='hidden lg:flex'>Orders</div>
                </NavLink>
            </div>
            {/*Desconectar*/}
            <div className='max-sm:ml-5 sm:mt-80'>
                {token&&(
                    <button onClick={()=>settoken('')} className='flexStart gap-x-2 sm:pl-12 p-5 medium-15 text-red-500 cursor-pointer h-10 rounded-xl'>
                        <BiLogOut className='text-xl'/>
                        <div className='hidden lg:flex'>Logout</div>
                    </button>
                )}
            </div>
        </div>
    </div>
  )
}

export default Sidebar