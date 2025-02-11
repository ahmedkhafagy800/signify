
import React, { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import LiveCamera from './components/LiveCamera';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const renderContent = () => {
  switch (activeTab) {
    case 'upload':
      return <VideoUpload />;
    case 'live':
      return <LiveCamera key="live" />;
    default:
      return null;
  }
};

  return (
    <div className="App">
      <h1>مترجم لغة الإشارة</h1>
      <nav>
        <button onClick={() => setActiveTab('upload')}>رفع فيديو</button>
        <button onClick={() => setActiveTab('live')}>كاميرا مباشرة</button>
      </nav>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
