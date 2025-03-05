import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import VideoUpload from './components/VideoUpload';
import LiveCamera from './components/LiveCamera';
import SignLanguageTable from './components/SignLanguageTable';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div>
      <Navbar />
      <div className="App">
        <h1>مترجم لغة الإشارة</h1>
        <div className="content">
          <Routes>
            <Route path="/upload" element={<VideoUpload />} />
            <Route path="/live" element={<LiveCamera />} />
            <Route path="/dictionary" element={<SignLanguageTable />} />
            <Route path="/" element={<VideoUpload />} /> {/* المسار الافتراضي */}
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
