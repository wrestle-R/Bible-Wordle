"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { auth } from "../firebase.config"
import { FiLogOut, FiUser, FiMenu, FiX } from "react-icons/fi"
import Profile from "./Profile"
import { initializeUserStats } from "../services/statsService"

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      console.log("Loading stats for user:", user.uid)
      const loadStats = async () => {
        try {
          console.log("Attempting to load stats for user:", user.uid)
          const stats = await initializeUserStats(user.uid)
          console.log("Received stats:", stats)
          if (!stats) {
            console.warn("No stats returned from initialization")
            return
          }
          setUserStats(stats)
        } catch (error) {
          console.error("Error loading stats:", error)
          setUserStats(null)
        }
      }
      loadStats()
    } else {
      console.log("No user, clearing stats")
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
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-black/30 backdrop-blur-md border border-gray-800/50 rounded-2xl z-50"
      >
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-white text-xl font-bold hover:text-purple-400 transition-colors">
                Bible Wordle
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/how-to-play" className="text-gray-300 hover:text-purple-400 transition-colors">
                How to Play
              </Link>

              <button
                onClick={() => navigate("/play")}
                className="px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Play Now
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
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
                      className="absolute right-0 mt-2 w-48 py-2 bg-black border border-gray-800 rounded-lg shadow-xl"
                    >
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-gray-900 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-gray-900 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link to="/signup" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-300 hover:text-purple-400" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-800/50"
            >
              <div className="px-4 py-3 flex flex-col gap-4">
                <Link
                  to="/how-to-play"
                  className="text-gray-300 hover:text-purple-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How to Play
                </Link>

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
                  <div className="flex flex-col gap-2 border-t border-gray-800/50 pt-3">
                    <div className="flex items-center gap-2 text-gray-300">
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
                      className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors py-2"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors py-2"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signup"
                    className="text-gray-300 hover:text-purple-400 transition-colors py-2"
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
        {showProfile && userStats && <Profile stats={userStats} onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </>
  )
}

export default Navbar
