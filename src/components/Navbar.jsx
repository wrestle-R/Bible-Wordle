import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../firebase.config';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userProfile');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-black/30 backdrop-blur-md border border-gray-800/50 rounded-2xl z-50"
    >
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold hover:text-purple-400 transition-colors">
              Bible Wordle
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/how-to-play" 
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              How to Play
            </Link>
            
            <button 
              onClick={() => navigate('/play')}
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
                      src={user.photoURL} 
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
              <Link 
                to="/signup" 
                className="text-gray-300 hover:text-purple-400 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
