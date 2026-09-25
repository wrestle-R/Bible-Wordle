import React, { useState, useEffect } from "react";
import { WarpBackground } from "../components/warp-background";
import Navbar from "../components/Navbar";
import { auth, provider, signInWithPopup } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      className="w-[min(400px,calc(100vw-2rem))]"
    >
      <Card className="gap-0 overflow-hidden border-primary/20 bg-card/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="items-center gap-3 px-8 pt-8 text-center">
        <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
        <CardDescription className="max-w-xs text-base">
          Sign in to track your progress and compete with others.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center px-8 py-8">
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          size="lg"
          className="w-full border-border bg-background font-medium transition-transform hover:scale-[1.02]"
        >
          <FcGoogle />
          Continue with Google
        </Button>
      </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
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
