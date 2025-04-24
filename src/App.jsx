import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'
import HowToPlay from './pages/HowToPlay'
// Fix the case sensitivity issue
import SignUp from './pages/SignUp'  // Match the actual file name case

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<Game />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App