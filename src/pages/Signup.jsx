import React, { useState, useEffect } from "react";
import { WarpBackground } from "../components/warp-background";
import Navbar from "../components/Navbar";
import { auth, provider, signInWithPopup } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User Data:', {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
        token: await user.getIdToken()
      });
      
      // Store user data in localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }));
      
      navigate('/play');
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const SignUpContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-black w-[400px] rounded-lg shadow-xl border border-gray-800 overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-white"
        >
          Welcome
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-400 text-center"
        >
          Sign in to track your progress and compete with others
        </motion.p>
        <motion.button
          onClick={handleGoogleSignIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      {isMobile ? (
        <div className="min-h-screen flex items-center justify-center">
          <SignUpContent />
        </div>
      ) : (
        <WarpBackground className="min-h-screen flex items-center justify-center">
          <SignUpContent />
        </WarpBackground>
      )}
    </div>
  );
}
