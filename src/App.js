
import React, { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import LiveCamera from './components/LiveCamera';
import SignLanguageTable from './components/SignLanguageTable';
import './App.css';
import newLogo from './signify.png';
function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const renderContent = () => {
  switch (activeTab) {
    case 'upload':
      return <VideoUpload />;
    case 'live':
      return <LiveCamera key="live" />;
    case 'dec':
      return <SignLanguageTable key="dec" />;
    default:
      return null;
  }
};

  return (
    <div>
          <nav className='navbar'>
        <img src={newLogo} className="logo-image" alt="Website Logo" width="150" />
        <ul className='nav-list'>
          <li><button className='btn' href=""onClick={() => setActiveTab('dec')}>القاموس</button></li>
          <li><a href="https://www.signify.com/learn">حول</a></li>
          </ul>
          </nav>
          <div className="App">
          {/* <header> */}
            {/* <img src={newLogo} className="logo-image" alt="Website Logo" width="150" /> */}
            {/* <h1>signify</h1> */}
          {/* </header> */}
          
            <h1>مترجم لغة الإشارة</h1>
            <nav className='nav'>
              <button onClick={() => setActiveTab('upload')}>رفع فيديو</button>
              <button onClick={() => setActiveTab('live')}>كاميرا مباشرة</button>
            </nav>
            <div className="content">
              {renderContent()}
            </div>
        </div>
    </div>

  );
}

export default App;
