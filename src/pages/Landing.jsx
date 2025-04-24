import { WarpBackground } from "../components/warp-background"
import Navbar from "../components/Navbar"
import { HyperText } from "../components/HyperText"
import AnimatedTextCycle from "../components/TextCycle"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

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
    <div className="bg-black w-[90%] sm:w-full max-w-[500px] h-auto py-10 md:h-72 rounded-lg shadow-xl border border-gray-800 overflow-hidden mx-4">
      <div className="flex flex-col justify-center items-center text-center h-full gap-4 md:gap-6 px-4 md:px-10">
        <HyperText
          text="BIBLE WORDLE"
          className="text-3xl md:text-5xl font-bold pb-4 md:pb-8 text-white tracking-tight"
          duration={1200}
        />
        <div className="flex flex-wrap justify-center gap-2 text-lg md:text-xl text-gray-300">
          <span>Master</span>
          <AnimatedTextCycle words={categories} interval={2000} className="text-purple-400" />
          <span>in Scripture</span>
        </div>
        <p className="text-base md:text-lg text-gray-400 leading-relaxed font-light">
          Think you can guess today's biblical word in 6 tries?
        </p>
        <Link 
          to="/play"
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Play Now
        </Link>
      </div>
    </div>
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
