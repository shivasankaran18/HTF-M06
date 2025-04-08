import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FFFDF2]">
        <Toaster position="top-right" />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;