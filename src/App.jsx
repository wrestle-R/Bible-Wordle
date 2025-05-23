import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'
import HowToPlay from './pages/HowToPlay'
import SignUp from './pages/SignUp'
import CrosswordPage from './pages/CrosswordPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<Game />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/crossword" element={<CrosswordPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App