import { WarpBackground } from "../components/warp-background"
import Navbar from "../components/Navbar"
import { HyperText } from "../components/HyperText"
import AnimatedTextCycle from "../components/TextCycle"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Landing() {
  const categories = ["Prophets", "Kings", "Places", "Events", "Characters"]
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const MainContent = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black/80 backdrop-blur-sm w-[90%] sm:w-full max-w-[520px] h-auto py-12 md:h-80 rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden mx-4 transition-all duration-300 hover:border-purple-500/30"
    >
      <div className="flex flex-col justify-center items-center text-center h-full gap-5 md:gap-7 px-5 md:px-12">
        <HyperText
          text="BIBLE WORDLE"
          className="text-3xl md:text-5xl font-bold pb-2 md:pb-12 text-white tracking-tight bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text "
          duration={1200}
        />
        <div className="flex flex-wrap justify-center gap-2 text-lg md:text-2xl text-gray-300">
          <span>Master</span>
          <AnimatedTextCycle words={categories} interval={2000} className="text-purple-400 font-semibold" />
          <span>in Scripture</span>
        </div>
        <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-md">
          Try to guess today's biblical word in 6 tries?
        </p>
        <motion.a 
          href="/play"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-900/30"
        >
          Play Now
        </motion.a>
      </div>
    </motion.div>
  )

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      {isMobile ? (
        <div className="min-h-screen flex items-center justify-center pt-16">
          <MainContent />
        </div>
      ) : (
        <WarpBackground className="min-h-screen flex items-center justify-center pt-16">
          <MainContent />
        </WarpBackground>
      )}
    </div>
  )
}
