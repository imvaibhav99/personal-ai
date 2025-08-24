import React from "react"
import { PlayCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import { motion } from "framer-motion"

const Hero = () => {
  const navigate = useNavigate()

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    hidden: { opacity: 0, y: `0.25em` },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  // Helper to split text into motion spans
  const AnimatedText = ({ text }) => (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className="inline-block"
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  )

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen 
      px-4 sm:px-20 xl:px-32 bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat text-center">

      {/* Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl 2xl:text-8xl font-extrabold leading-tight">
        <AnimatedText text="Create amazing content" /> <br />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-md">
          <AnimatedText text="with AI Tools" />
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-xs sm:max-w-xl 2xl:max-w-2xl mx-auto text-sm sm:text-lg text-gray-500 leading-relaxed">
        <AnimatedText text="Transform your content creation with our suite of premium AI tools. Write articles, generate images, remove backgrounds, and more with ease." />
      </p>

      {/* Buttons */}
      <div className="flex items-center justify-center mt-10 gap-4 flex-wrap ">
        <motion.button
          onClick={() => navigate("/ai")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer px-8 py-4 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 
          font-semibold text-lg shadow-lg transition-all duration-300"
        >
          Start Creating Now
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer flex items-center gap-2 px-8 py-4 rounded-full border border-gray-300/50 
          text-gray-700 bg-white/60 backdrop-blur-sm font-medium text-lg 
          transition-all duration-300 shadow-md hover:shadow-xl hover:bg-white/80"
        >
          <PlayCircle className=" w-6 h-6 text-blue-600" />
          Watch Demo
        </motion.button>
      </div>

      {/* Trusted By Section */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
        text-gray-500 text-sm flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
        <img src={assets.user_group} alt="users" className="h-8" />
        <span className="font-medium">Trusted by 1000+ creators</span>
      </div>
    </div>
  )
}

export default Hero
