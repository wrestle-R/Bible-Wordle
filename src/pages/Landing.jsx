import { WarpBackground } from "../components/warp-background"
import Navbar from "../components/Navbar"
import { HyperText } from "../components/HyperText"
import AnimatedTextCycle from "../components/TextCycle"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
      className="mx-4 mt-4 w-[90%] max-w-[520px] sm:w-full md:mr-16"
    >
      <Card className="h-auto gap-0 overflow-hidden border-primary/20 bg-card/90 py-12 shadow-2xl backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 md:h-80 md:py-0">
      <CardContent className="flex h-full flex-col items-center justify-center gap-5 px-5 text-center md:gap-7 md:px-12">
        <HyperText
          text="BIBLE WORDLE"
          className="pb-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent md:pb-12 md:text-5xl"
          duration={1200}
        />
        <div className="flex flex-wrap justify-center gap-2 text-lg text-foreground md:text-2xl">
          <span>Master</span>
          <AnimatedTextCycle words={categories} interval={2000} className="text-purple-400 font-semibold" />
          <span>in Scripture</span>
        </div>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          Try to guess today's biblical word in 6 tries?
        </p>
        <Button asChild size="lg" className="mt-2 h-auto rounded-lg px-8 py-3 font-medium shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95">
          <a href="/play">Play Now</a>
        </Button>
      </CardContent>
      </Card>
    </motion.div>
  )

  const DailyVerseSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: mounted && !verseLoading ? 1 : 0, y: mounted && !verseLoading ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      className="mx-4 mb-8 w-[90%] max-w-[520px] sm:w-full"
    >
      {!verseLoading && dailyVerse && (
        <Card className="gap-0 border-primary/20 bg-card/80 py-4 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:border-primary/40">
        <CardContent className="flex flex-col gap-2 px-5 text-center md:px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xs font-semibold tracking-wide text-primary uppercase md:text-sm"
          >
            Today's Daily Verse
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-sm italic leading-relaxed text-muted-foreground md:text-base"
          >
            "{dailyVerse.verse}"
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-xs font-medium text-primary md:text-sm"
          >
            — {dailyVerse.reference}
          </motion.p>
        </CardContent>
        </Card>
      )}
    </motion.div>
  )

  return (
    <div className="min-h-screen overflow-hidden bg-background">
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
