import React from "react"
import { AiToolsData } from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"

const AiTools = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Powerful AI Tools
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Everything you need to create, enhance, and optimize your content with
          cutting-edge AI technologies.
        </p>
      </div>

      {/* Tools Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.15 },
          },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        {AiToolsData.map((tool, index) => (
          <motion.div
            key={index}
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            whileHover={user ? { scale: 1.07 } : {}}
            whileTap={user ? { scale: 0.97 } : {}}
            onClick={() => {
              if (user) navigate(tool.path)
            }}
            className={`relative group flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg
              backdrop-blur-xl bg-white/70 border border-gray-200/50 
              transition cursor-pointer overflow-hidden ${
                user
                  ? "hover:shadow-2xl hover:border-primary/70"
                  : "opacity-60 cursor-not-allowed"
              }`}
          >
            {/* Hover glow border */}
            <div
              className={`absolute inset-0 rounded-2xl border-2 border-transparent 
                bg-gradient-to-r from-primary/20 to-purple-400/20 
                opacity-0 group-hover:opacity-100 transition duration-500`}
            />

            {/* Gradient Icon */}
            <div
              className="p-6 rounded-full mb-5 transition-all group-hover:scale-110 shadow-md relative z-10"
              style={{
                background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            >
              <tool.Icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <p className="font-bold text-center text-gray-900 text-lg group-hover:text-primary transition relative z-10">
              {tool.title}
            </p>

            {/* Description */}
            <p className="text-gray-500 text-sm text-center mt-2 relative z-10">
              {tool.description}
            </p>

            {/* Locked Overlay */}
            {!user && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default AiTools

