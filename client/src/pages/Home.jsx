import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import { assets } from '../assets/assets'
import Plan from '../components/Plan'
import Footer from '../components/Footer'



const Home = () => {
  return (
   <>
   <Navbar/>
   <Hero/>
   <AiTools/>
     {/* Trusted by section */}
      <div className="px-4 sm:px-20 xl:px-32 mt-16 mb-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
        <img src={assets.user_group} alt="" className="h-8" />
        Trusted by 1000+ users
      </div>
      <Plan/>
      <Footer/>
   </>
  )
}

export default Home
