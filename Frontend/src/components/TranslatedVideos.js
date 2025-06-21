import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddVideoForm from './AddVideoForm';
import './TranslatedVideos.css';

const TranslatedVideos = ({ isDarkMode, onToggleDarkMode }) => {
  const [selectedPlace, setSelectedPlace] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/videos');
      setVideos(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الفيديوهات');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSuccess = (videoData) => {
    if (editingVideo) {
      // Handle update
      setVideos(prev => prev.map(v => v._id === videoData._id ? videoData : v));
    } else {
      // Handle add
      setVideos(prev => [videoData, ...prev]);
    }
  };

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
        
        <div className="header-actions">
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
          
          <button 
            className="add-video-button"
            onClick={() => setShowAddForm(true)}
          >
            <span className="button-icon">+</span>
            إضافة فيديو جديد
          </button>
        </div>
      </div>

      <div className="videos-grid">
        {filteredVideos.map((video) => (
          <div key={video._id || video.id} className="video-card">
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
              {/* <button 
                className="edit-video-button"
                onClick={() => setEditingVideo(video)}
              >
                تعديل
              </button> */}
            </div>
          </div>
        ))}
      </div>

      {(showAddForm || editingVideo) && (
        <AddVideoForm
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowAddForm(false);
            setEditingVideo(null);
          }}
          onSuccess={handleSuccess}
          videoToEdit={editingVideo}
        />
      )}
    </div>
  );
};

export default TranslatedVideos; 