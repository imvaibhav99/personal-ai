import React from "react"
import {  Twitter, Linkedin, Github } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center space-y-6">
        
        {/* Brand */}
        <h2 className="text-2xl font-bold text-white">Quick.ai</h2>
        <p className="text-center text-sm text-gray-400 max-w-md">
          Building modern solutions that empower businesses to grow and succeed.  
          Made with ❤️ and innovation.
        </p>

        {/* Social Links */}
        <div className="flex space-x-6">
         
          <a href="#" className="hover:text-white transition">
            <Twitter size={22} />
          </a>
          <a href="#" className="hover:text-white transition">
            <Linkedin size={22} />
          </a>
          <a href="#" className="hover:text-white transition">
            <Github size={22} />
          </a>
          
          
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-700" />

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Quick.ai. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
