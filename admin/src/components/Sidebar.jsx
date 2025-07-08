import React from 'react'
import { NavLink } from 'react-router-dom'
import {FaSquarePlus} from 'react-icons/fa6'
import {FaListAlt} from 'react-icons/fa'
import {MdFactCheck} from 'react-icons/md'
import {BiLogOut} from 'react-icons/bi'
import { FaUsers, FaChartBar } from 'react-icons/fa'

const Sidebar = ({ token, setToken, userRole, permissions }) => {
  // Función para verificar permisos
  const hasPermission = (resource, action) => {
    return permissions.includes(`${resource}:${action}`)
  }

  return (
    <div className='pb-3 bg-white rounded max-sm:flexCenter max-xs:pb-3 sm:w-1/5 sm:min-h-screen'>
        <div className='flex pt-5 max-sm:items-center sm:flex-col'>
            <div className='flex sm:flex-col gap-x-5 gap-y-8 sm:pt-10'>


                {/* Mostrar solo si tiene permiso para ver dashboard */}
                {hasPermission('dashboard', 'read') && (
                  <NavLink to={'/'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                      <FaChartBar/>
                      <div className='hidden lg:flex'>Dashboard</div>
                  </NavLink>
                )}


                {/* Mostrar solo si tiene permiso para crear productos */}
                {hasPermission('products', 'create') && (
                  <NavLink to={'/add'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                      <FaSquarePlus />
                      <div className='hidden lg:flex'>Add Items</div>
                  </NavLink>
                )}
               
                {/* Mostrar solo si tiene permiso para ver productos */}
                {hasPermission('products', 'read') && (
                  <NavLink to={'/list'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                      <FaListAlt/>
                      <div className='hidden lg:flex'>List Items</div>
                  </NavLink>
                )}
               
                {/* Mostrar solo si tiene permiso para ver órdenes */}
                {hasPermission('orders', 'read') && (
                  <NavLink to={'/orders'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                      <MdFactCheck/>
                      <div className='hidden lg:flex'>Orders</div>
                  </NavLink>
                )}



                {/* Mostrar solo si es administrador */}
                {userRole === 'admin' && (
                  <>
                    <NavLink to={'/users'} className={({isActive})=>isActive ? 'active-link': 'flexStart gap-x-2 sm:pl-12 p-5 medium-15 cursor-pointer h-10 rounded-xl'}>
                        <FaUsers/>
                        <div className='hidden lg:flex'>Manage Users</div>
                    </NavLink>
                  </>
                )}
            </div>
            {/*Desconectar*/}
            <div className='max-sm:ml-5 sm:mt-80'>
                {token && (
                    <button onClick={() => setToken('')} className='h-10 p-5 text-red-500 cursor-pointer flexStart gap-x-2 sm:pl-12 medium-15 rounded-xl'>
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