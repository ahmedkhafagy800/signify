// App.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import VideoUpload from './components/VideoUpload';
import LiveCamera from './components/LiveCamera';
import SignLanguageTable from './components/SignLanguageTable';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import './App.css';
import TranslatedTextDisplay from './components/TranslatedTextDisplay';
import Contact from "./components/Contact"
function App() {
const [isDarkMode, setIsDarkMode] = useState(() => {
  // قراءة القيمة من Local Storage إذا وجدت
  const storedTheme = localStorage.getItem('darkMode');
  return storedTheme === 'true' ? true : false;
});

const handleToggleDarkMode = () => {
  setIsDarkMode((prev) => {
    const newValue = !prev;
    localStorage.setItem('darkMode', newValue);
    return newValue;
  });
};

  return (
    <div className={isDarkMode ? "App dark-mode" : "App"}>
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      
      <div className="content">
        <Routes>
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/live" element={<LiveCamera />} />
          <Route path="/dictionary" element={<SignLanguageTable />} />
          <Route path="/" element={<VideoUpload />} /> {/* المسار الافتراضي */}
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
  