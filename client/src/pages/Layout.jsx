import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { X, Menu } from "lucide-react"
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'   // <-- FIXED import
import { SignIn,useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const {user} = useUser()

  return user? (
    <div className='flex flex-col items-start justify-start h-screen'>
      
      {/* Navbar */}
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img
          className='cursor-pointer h-10'
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate('/')}
        />
        {
          sidebar
            ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'/>
            : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'/>
        }
      </nav>

      {/* Main Layout */}
      <div className='flex-1 w-full flex h-[calc(100vh-56px)]'> 
        {/* Sidebar */}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Main Content */}
        <div className='flex-1 bg-[#F4F7FB] p-4 overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  ): (
    <div >
        <SignIn/>
    </div>
  )
}

export default Layout
