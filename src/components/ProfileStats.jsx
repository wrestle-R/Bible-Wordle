import React from 'react'
import { FiGrid, FiBook, FiCrosshair, FiClock } from "react-icons/fi";
import StatCard from './StatCard';

const ProfileStats = ({ stats }) => {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg text-purple-300 mb-3">
        <FiGrid className="w-5 h-5" />
        <span>Profile Stats</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Games Played"
          value={stats.gamesPlayed || 0}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Games Won"
          value={stats.gamesWon || 0}
          color="bg-green-500/20"
        />
        <StatCard
          title="Win Rate"
          value={stats.gamesPlayed 
            ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` 
            : '0%'}
          color="bg-yellow-500/20"
        />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak || 0}
          color="bg-red-500/20"
        />
        <StatCard
          title="Max Streak"
          value={stats.maxStreak || 0}
          color="bg-purple-500/20"
        />
      </div>

      <h3 className="flex items-center gap-2 text-lg text-purple-300 mb-3 mt-6">
        <FiCrosshair className="w-5 h-5" />
        <span>Crossword Stats</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Completed"
          value={stats.crossword?.gamesPlayed || 0}
          color="bg-violet-500/20"
        />
        <StatCard
          title="Win Rate"
          value={stats.crossword?.gamesPlayed 
            ? `${Math.round((stats.crossword.gamesWon / stats.crossword.gamesPlayed) * 100)}%` 
            : '0%'}
          color="bg-teal-500/20"
        />
        <StatCard
          title="Best Time"
          value={stats.crossword?.bestTime 
            ? `${Math.floor(stats.crossword.bestTime / 60)}m ${stats.crossword.bestTime % 60}s` 
            : 'N/A'}
          color="bg-amber-500/20"
          icon={<FiClock className="w-4 h-4 text-amber-400" />}
        />
        <StatCard
          title="Last Played"
          value={stats.crossword?.lastPlayed 
            ? new Date(stats.crossword.lastPlayed).toLocaleDateString() 
            : 'Never'}
          color="bg-lime-500/20"
          small
        />
      </div>
    </div>
  );
};

export default ProfileStats;