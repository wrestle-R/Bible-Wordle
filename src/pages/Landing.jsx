import { WarpBackground } from "../components/warp-background"
import Navbar from "../components/Navbar"
import { HyperText } from "../components/HyperText"
import AnimatedTextCycle from "../components/TextCycle"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Landing() {
  const categories = ["Prophets", "Kings", "Places", "Events", "Characters"]
  const [isMobile, setIsMobile] = useState(false)
  const [dailyVerse, setDailyVerse] = useState(null)
  const [verseLoading, setVerseLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        // Try fetching from API first
        const url = 'https://beta.ourmanna.com/api/v1/get?format=json&order=daily'
        const options = { method: 'GET', headers: { accept: 'application/json' } }
        
        const response = await fetch(url, options)
        const data = await response.json()
        
        if (data && data.verse && data.verse.details) {
          setDailyVerse({
            verse: data.verse.details.text,
            reference: data.verse.details.reference
          })
        } else {
          throw new Error('Invalid API response')
        }
      } catch (error) {
        console.log('Falling back to local verses:', error)
        // Fallback to local JSON
        try {
          const response = await fetch('/daily-verses.json')
          const verses = await response.json()
          const today = new Date().getDate() // Gets day of month (1-31)
          const verseOfDay = verses.find(v => v.day === today) || verses[0]
          setDailyVerse({
            verse: verseOfDay.verse,
            reference: verseOfDay.reference
          })
        } catch (fallbackError) {
          console.error('Failed to load fallback verses:', fallbackError)
        }
      } finally {
        setVerseLoading(false)
      }
    }

    fetchDailyVerse()
  }, [])

  const MainContent = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/80 backdrop-blur-sm w-[90%] sm:w-full max-w-[520px] h-auto py-12 md:h-80 md:mr-16 mt-4 rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden mx-4 transition-all duration-300 hover:border-purple-500/30"
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

  const DailyVerseSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted && !verseLoading ? 1 : 0, y: mounted && !verseLoading ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      className="bg-black/60 backdrop-blur-sm w-[90%] sm:w-full max-w-[520px] py-4 px-5 md:px-6 rounded-lg shadow-lg border border-purple-500/20 mb-8 mx-4 hover:border-purple-500/30 transition-all duration-300"
    >
      {!verseLoading && dailyVerse && (
        <div className="flex flex-col gap-2 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xs md:text-sm text-purple-300 font-semibold tracking-wide uppercase"
          >
            Today's Daily Verse
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-sm md:text-base text-gray-300 italic leading-relaxed"
          >
            "{dailyVerse.verse}"
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-xs md:text-sm text-purple-400 font-medium"
          >
            — {dailyVerse.reference}
          </motion.p>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="bg-black min-h-screen overflow-hidden">
      <Navbar />
      {isMobile ? (
        <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 gap-6">
          <MainContent />
          {!verseLoading && <DailyVerseSection />}
        </div>
      ) : (
        <WarpBackground className="min-h-screen flex flex-col items-center justify-center pt-16 gap-8">
          <MainContent />
          {!verseLoading && <DailyVerseSection />}
        </WarpBackground>
      )}
    </div>
  )
}
