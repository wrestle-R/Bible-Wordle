import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const Letter = ({ children, color }) => (
  <div className={`w-12 h-12 ${color} border-2 flex items-center justify-center text-xl font-bold rounded m-1`}>
    {children}
  </div>
);

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full mx-auto p-6 pt-24"
        >
          {/* About Section */}
          <motion.section variants={itemVariants} className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">About Bible Wordle</h2>
            <p className="text-gray-300 leading-relaxed">
              Bible Wordle is a spiritual journey disguised as a word game, designed to deepen your understanding of biblical characters, events, and places. Created with love for the church community, this game aims to make biblical learning engaging and memorable for people of all ages, especially youth. Every word tells a story from Scripture, making the Bible's timeless wisdom accessible through modern gameplay.
            </p>
          </motion.section>

          {/* How to Play Section */}
          <motion.section variants={itemVariants} className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white mb-6">How to Play</h2>
            
            <div className="space-y-6 text-gray-300">
              <p>Guess the biblical word in 6 tries:</p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Letter color="bg-green-500/20 border-green-500">P</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">T</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">R</Letter>
                  <span className="ml-4 text-gray-300">Green = Correct letter, correct spot</span>
                </div>

                <div className="flex items-center">
                  <Letter color="border-gray-600">M</Letter>
                  <Letter color="bg-yellow-500/20 border-yellow-500">O</Letter>
                  <Letter color="border-gray-600">S</Letter>
                  <Letter color="border-gray-600">E</Letter>
                  <Letter color="border-gray-600">S</Letter>
                  <span className="ml-4 text-gray-300">Yellow = Correct letter, wrong spot</span>
                </div>

                <div className="flex items-center">
                  <Letter color="bg-gray-800/50 border-gray-600">J</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">U</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">D</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">A</Letter>
                  <Letter color="bg-gray-800/50 border-gray-600">S</Letter>
                  <span className="ml-4 text-gray-300">Gray = Letter not in word</span>
                </div>
              </div>

              <div className="space-y-2 mt-8">
                <h3 className="text-xl font-semibold text-white">Special Hints</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>After 4 attempts: Reveals Testament (Old/New)</li>
                  <li>After 5 attempts: Reveals Category (Person/Place/Event)</li>
                </ul>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-6">
                <p className="text-sm">
                  When the game ends, you'll discover the word's biblical significance, including its verse location and special moment in Scripture. Each game is an opportunity to learn something new about the Bible!
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
    </div>
  );
}
