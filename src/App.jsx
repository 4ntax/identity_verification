import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App