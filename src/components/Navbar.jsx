"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { auth } from "../firebase.config"
import { FiLogOut, FiUser, FiMenu, FiX } from "react-icons/fi"
import Profile from "./Profile"
import { initializeUserStats } from "../services/statsService"
import { getCrosswordStats } from "../utils/crosswordUtils" // Add this import
import { useTheme } from "../hooks/useTheme"
import ThemeToggle from "./ThemeToggle"

// Add crossword route to the navItems array
const navItems = [
  { path: '/', label: 'Wordle' },
  { path: '/quiz', label: 'Quiz' },
  { path: '/crossword', label: 'Crossword' },
  { path: '/profile', label: 'Profile' },
];

const Navbar = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      const loadStats = async () => {
        try {
          const gameStats = await initializeUserStats(user.uid)
          const crossStats = await getCrosswordStats() // Add this line
          if (!gameStats) {
            console.warn("No stats returned from initialization")
            return
          }
          setUserStats({
            ...gameStats,
            crosswordStats: crossStats // Add crossword stats to user stats
          })
        } catch (error) {
          console.error("Error loading stats:", error)
          setUserStats(null)
        }
      }
      loadStats()
    } else {
      setUserStats(null)
    }
  }, [user, showProfile])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      localStorage.removeItem("userProfile")
      navigate("/")
      setShowDropdown(false)
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (showDropdown) setShowDropdown(false)
  }

  const handleProfileClick = () => {
    setShowProfile(true)
    setShowDropdown(false)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl rounded-2xl border border-slate-300/70 bg-white/75 backdrop-blur-md z-50 dark:border-gray-800/50 dark:bg-black/30"
      >
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-slate-900 text-xl font-bold hover:text-purple-600 transition-colors dark:text-white dark:hover:text-purple-400">
                Bible Wordle
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/how-to-play" className="text-slate-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
                How to Play
              </Link>

              <button
                onClick={() => navigate("/play")}
                className="px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Play Now
              </button>

              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-slate-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL || "/placeholder.svg"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-700"
                      />
                    ) : (
                      <FiUser className="w-5 h-5" />
                    )}
                  </button>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 py-2 bg-white border border-slate-200 rounded-lg shadow-xl dark:bg-black dark:border-gray-800"
                    >
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-slate-100 transition-colors dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-900"
                      >
                        <FiUser className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-slate-100 transition-colors dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-900"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link to="/signup" className="text-slate-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} className="h-9 w-9" />
              <button className="text-slate-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-300/70 dark:border-gray-800/50"
            >
              <div className="px-4 py-3 flex flex-col gap-4">
                <Link
                  to="/how-to-play"
                  className="text-slate-700 hover:text-purple-600 transition-colors py-2 dark:text-gray-300 dark:hover:text-purple-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How to Play
                </Link>

                <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white/70 px-3 py-2 dark:border-gray-800 dark:bg-black/30">
                  <span className="text-sm text-slate-700 dark:text-gray-300">Theme</span>
                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} className="h-9 w-9" />
                </div>

                <div className="flex">
                  <button
                    onClick={() => {
                      navigate("/play")
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Play Now
                  </button>
                </div>

                {user ? (
                  <div className="flex flex-col gap-2 border-t border-slate-300/70 pt-3 dark:border-gray-800/50">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL || "/placeholder.svg"}
                          alt="Profile"
                          className="w-6 h-6 rounded-full border border-gray-700"
                        />
                      ) : (
                        <FiUser className="w-5 h-5" />
                      )}
                      <span>{user.displayName || user.email}</span>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 text-slate-700 hover:text-purple-600 transition-colors py-2 dark:text-gray-300 dark:hover:text-purple-400"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-slate-700 hover:text-purple-600 transition-colors py-2 dark:text-gray-300 dark:hover:text-purple-400"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signup"
                    className="text-slate-700 hover:text-purple-600 transition-colors py-2 dark:text-gray-300 dark:hover:text-purple-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && userStats && (
          <Profile 
            stats={userStats} 
            crosswordStats={userStats.crosswordStats}
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
