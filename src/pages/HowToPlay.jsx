"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

const Letter = ({ children, color }) => {
  // Responsive sizing for letter tiles
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Check on mount and when window resizes
    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const tileSize = isMobile ? "w-8 h-8 text-sm" : "w-12 h-12 text-xl"

  return (
    <div className={`${tileSize} ${color} border-2 flex items-center justify-center font-bold rounded m-1`}>
      {children}
    </div>
  )
}

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full mx-auto p-4 sm:p-6 pt-20 sm:pt-24"
      >
        {/* About Section */}
        <motion.section
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-lg p-4 sm:p-8 mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">About Bible Wordle</h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          Bible Wordle is where scripture meets strategy. It’s a fresh, fast-paced word game that dives into the people, places, and moments of the Bible—without feeling like a Sunday school quiz. Built for everyone from curious minds to committed believers, it’s a fun way to level up your Bible knowledge while keeping it real. Every word has a story. Ready to play yours?
          </p>
        </motion.section>

        {/* How to Play Section */}
        <motion.section
          variants={itemVariants}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-lg p-4 sm:p-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">How to Play</h2>

          <div className="space-y-4 sm:space-y-6 text-gray-300 text-sm sm:text-base">
            <p>Guess the biblical word in 6 tries:</p>

            <div className="space-y-4">
              {/* Responsive layout for letter examples */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex mb-2 sm:mb-0">
                  <Letter color="bg-green-500/20 border-green-500">P</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">T</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">R</Letter>
                </div>
                <span className="ml-1 sm:ml-4 text-gray-300">Green = Correct letter, correct spot</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex mb-2 sm:mb-0">
                  <Letter color="border-gray-600">M</Letter>
                  <Letter color="bg-yellow-500/20 border-yellow-500">O</Letter>
                  <Letter color="border-gray-600">S</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">S</Letter>
                </div>
                <span className="ml-1 sm:ml-4 text-gray-300">Yellow = Correct letter, wrong spot</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex mb-2 sm:mb-0">
                  <Letter color="bg-gray-800/50 border-gray-600">J</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">U</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">D</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">A</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">S</Letter>
                </div>
                <span className="ml-1 sm:ml-4 text-gray-300">Gray = Letter not in word</span>
              </div>
            </div>

            <div className="space-y-2 mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Special Hints</h3>
              <ul className="list-disc list-inside space-y-1 sm:space-y-2 pl-1">
                <li>After 4 attempts: Reveals Testament (Old/New)</li>
                <li>After 5 attempts: Reveals Category (Person/Place/Event)</li>
              </ul>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm">
                When the game ends, you'll discover the word's biblical significance, including its verse location and
                special moment in Scripture. Each game is an opportunity to learn something new about the Bible!
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
