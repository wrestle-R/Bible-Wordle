"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import { auth } from "../firebase.config"
import Wordle from "../components/Wordle"
import { Toaster } from "react-hot-toast"
import { getDailyWord } from "../utils/wordUtils"
import { FiLock } from "react-icons/fi"
import { updateGameStats } from "../services/statsService"
import { getGameState } from "../services/gameStateService"
import { db } from "../firebase.config"
import { doc, onSnapshot } from "firebase/firestore"

export default function Game() {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState(null)
  const [currentWord, setCurrentWord] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isFirstGameOfDay, setIsFirstGameOfDay] = useState(true)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    // Check authentication
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const profile = localStorage.getItem("userProfile")
        if (profile) {
          setUserProfile(JSON.parse(profile))
        }
      }
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    // Updated fetch logic with better error handling
    const fetchWord = async () => {
      try {
        // Add cache control headers
        const response = await fetch("/5letter.jsonl", {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        
        // Split and parse lines with error handling
        const words = text
          .trim()
          .split("\n")
          .map(line => {
            try {
              return JSON.parse(line.trim());
            } catch (err) {
              console.error("Error parsing line:", line, err);
              return null;
            }
          })
          .filter(Boolean); // Remove any null entries from failed parses

        if (words.length === 0) {
          throw new Error("No valid words found in word list");
        }

        console.log("Successfully loaded words:", words.length);
        const dailyWord = getDailyWord(words);
        setCurrentWord(dailyWord);
      } catch (error) {
        console.error("Error loading word list:", error);
        // Fallback to a default word if needed
        setCurrentWord({
          name: "JESUS",
          verse_location: "Matthew 1:21",
          description: "The Messiah",
          category: "prophets",
          special_moment: "Born to save people from their sins."
        });
      }
    };

    fetchWord();
  }, []);

  useEffect(() => {
    const gameState = getGameState()
    if (gameState?.completed) {
      setIsFirstGameOfDay(false)
    }
  }, [])

  useEffect(() => {
    if (userProfile && auth.currentUser) {
      // Set up real-time listener for stats
      const unsubscribe = onSnapshot(
        doc(db, "users", auth.currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            setUserStats(doc.data() || null)
          }
        },
        (error) => {
          console.error("Error fetching stats:", error)
        },
      )

      return () => unsubscribe()
    }
  }, [userProfile])

  if (!currentWord) return null

  const handleGameComplete = async (gameResult) => {
    if (userProfile && auth.currentUser) {
      console.log("Game completed with result:", gameResult)
      try {
        const updatedStats = await updateGameStats(auth.currentUser.uid, gameResult)
        console.log("Updated stats:", updatedStats)
        if (updatedStats) {
          setUserStats(updatedStats)
        }
      } catch (error) {
        console.error("Error updating stats:", error)
      }
    } else {
      console.log("No user profile or not authenticated")
      setShowLoginPrompt(true)
    }
  }

  const LoginPromptModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-black/80 p-6 rounded-xl border border-purple-500/30 max-w-md w-full"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <FiLock className="w-12 h-12 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Sign In to Track Progress</h2>
          <p className="text-gray-300">Create an account to:</p>
          <ul className="text-left text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Track your win streak
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Save your statistics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Compete with others
            </li>
          </ul>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Toaster />
      <div className="pt-20 md:pt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          {userProfile ? (
            <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {userProfile.photo && (
                    <img
                      src={userProfile.photo || "/placeholder.svg"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-white">{userProfile.name}</h2>
                    <p className="text-sm text-gray-400">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Games</p>
                    <p className="text-xl text-white">{userStats?.gamesPlayed || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Win Rate</p>
                    <p className="text-xl text-white">{Math.round(userStats?.winPercentage || 0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Streak</p>
                    <p className="text-xl text-white">{userStats?.currentStreak || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-lg p-4 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <p className="text-gray-400">Playing as Guest</p>
                <button
                  onClick={() => setShowLoginPrompt(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Sign in to track progress
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 md:mt-8">
            <Wordle
              wordData={currentWord}
              onGameComplete={(result) => {
                if (isFirstGameOfDay && userProfile) {
                  handleGameComplete(result)
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{showLoginPrompt && <LoginPromptModal />}</AnimatePresence>
    </div>
  )
}
