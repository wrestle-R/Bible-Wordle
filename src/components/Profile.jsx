import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiZap, FiClock, FiGrid, FiHash } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const StatCard = ({ title, value, icon: Icon, description }) => (
  <div className="bg-purple-900/10 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <h3 className="text-sm text-purple-300 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function Profile({ stats, crosswordStats, onClose }) {
  const [gameType, setGameType] = useState('wordle');

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] overflow-y-auto"
    >
      <div className="min-h-screen px-4 py-16" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-black/80 max-w-2xl mx-auto rounded-xl border border-purple-500/30 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Statistics</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Game Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setGameType('wordle')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  gameType === 'wordle' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiHash /> Wordle
              </button>
              <button
                onClick={() => setGameType('crossword')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  gameType === 'crossword' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiGrid /> Crossword
              </button>
            </div>

            {gameType === 'wordle' ? (
              // Wordle Stats
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <StatCard
                    title="Win Rate"
                    value={`${stats.winPercentage.toFixed(1)}%`}
                    icon={FiTrendingUp}
                  />
                  <StatCard
                    title="Current Streak"
                    value={stats.currentStreak}
                    icon={FiZap}
                  />
                  <StatCard
                    title="Max Streak"
                    value={stats.maxStreak}
                    icon={FiAward}
                  />
                  <StatCard
                    title="Average Moves"
                    value={stats.averageMoves.toFixed(1)}
                    icon={FiClock}
                  />
                </div>

                <div className="bg-purple-900/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Guess Distribution
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.distribution).map(([guess, count]) => (
                      <div key={guess} className="flex items-center gap-2">
                        <div className="w-4 text-sm text-gray-400">{guess}</div>
                        <div className="flex-1 bg-purple-900/20 rounded">
                          <div
                            className="bg-purple-500/20 rounded py-1 px-2 text-xs text-purple-200"
                            style={{
                              width: `${(count / stats.gamesWon) * 100}%`,
                              minWidth: count > 0 ? '2rem' : '0',
                            }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Crossword Stats
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {crosswordStats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard
                      title="Puzzles Completed"
                      value={crosswordStats.gamesCompleted || 0}
                      icon={FiGrid}
                    />
                    <StatCard
                      title="Average Time"
                      value={formatTime(crosswordStats.averageTime || 0)}
                      icon={FiClock}
                    />
                    <StatCard
                      title="Best Time"
                      value={formatTime(crosswordStats.bestTime || 0)}
                      icon={FiAward}
                    />
                    <StatCard
                      title="Current Streak"
                      value={crosswordStats.currentStreak || 0}
                      icon={FiZap}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No crossword stats available yet. Complete a crossword to see your progress!
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return createPortal(content, document.body);
}
