import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TranslatedVideos.css';

const TranslatedVideos = ({ isDarkMode, onToggleDarkMode }) => {
  const [selectedPlace, setSelectedPlace] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('حطلي الايند بوينت هنا يا قلبي ');
        setVideos(response.data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الفيديوهات');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const places = ['all', ...new Set(videos.map(video => video.place))];
  
  const filteredVideos = selectedPlace === 'all' 
    ? videos 
    : videos.filter(video => video.place === selectedPlace);

  if (loading) {
    return (
      <div className={`videos-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`videos-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`videos-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="videos-header">
        <h1 className="videos-title">فيديوهات مترجمة بلغة الإشارة</h1>
        
        <div className="place-selector">
          <select
            value={selectedPlace}
            onChange={(e) => setSelectedPlace(e.target.value)}
            className="place-select"
          >
            <option value="all">جميع الأماكن</option>
            {places.filter(place => place !== 'all').map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="videos-grid">
        {filteredVideos.map((video) => (
          <div key={video.id} className="video-card">
            <div className="video-wrapper">
              <video
                src={video.videoUrl}
                controls
                className="video-player"
              />
            </div>
            <div className="video-content">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-place">المكان: {video.place}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslatedVideos; 