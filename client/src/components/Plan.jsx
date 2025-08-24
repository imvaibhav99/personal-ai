import React from "react"
import { PricingTable } from "@clerk/clerk-react"
import { motion } from "framer-motion"

const Plan = () => {
  return (
    <div className="relative py-24 px-6 sm:px-12 lg:px-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-100/30 to-transparent -z-10" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
          Unlock the full power of our platform with flexible plans designed for everyone.  
          Upgrade when you're ready to scale 🚀
        </p>
      </motion.div>

      {/* Pricing Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200 
          shadow-xl rounded-3xl p-8 sm:p-12"
      >
        <PricingTable />
      </motion.div>
    </div>
  )
}

export default Plan
