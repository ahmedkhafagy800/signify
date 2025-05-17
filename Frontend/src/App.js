import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import VideoUpload from './components/VideoUpload';
import LiveCamera from './components/LiveCamera';
import SignLanguageTable from './components/SignLanguageTable';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import TranslatedTextDisplay from './components/TranslatedTextDisplay';
import Contact from "./components/Contact";
import './App.css';
import load from "./assets/loader5.jpg";  
import TranslatedVideos from './components/TranslatedVideos';
function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('darkMode');
    return storedTheme === 'true';
  });

  const [loading, setLoading] = useState(true); 
  const [fadeOut, setFadeOut] = useState(false); 

  useEffect(() => {
    setTimeout(() => {
      setFadeOut(true); 
      setTimeout(() => {
        setLoading(false);
      }, 1000); 
    }, 2500);
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue);
      return newValue;
    });
  };

  return (
    <div className={isDarkMode ? "App dark-mode" : "App"}>
      {loading ? (
        <div className={`loader-container ${fadeOut ? "fade-out" : ""}`}>
          <img src={load} alt="Loading..." className="loader-image" />
        </div>
      ) : (
        <>
          <Navbar isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
          <div className="content">
            <Routes>
              <Route path="translatedvideos" element={<TranslatedVideos  isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}/>} />
              <Route path="/upload" element={<VideoUpload isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />} />
              <Route path="/contact" element={<Contact isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}/>} />
              <Route path="/live" element={<LiveCamera isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}/>} />
              <Route path="/dictionary" element={<SignLanguageTable isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}/>} />
              <Route path="/" element={<TranslatedVideos isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}/>} />
            </Routes>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
