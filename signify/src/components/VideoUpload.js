import React, { useState } from 'react';
import useStore from '../store';
import './VideoUpload.css';
import TranslatedTextDisplay from './TranslatedTextDisplay';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const { appendTranslatedText } = useStore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('يرجى اختيار فيديو أولاً');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      appendTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div className="video-upload-container">
      {/* <h2 className="video-upload-title">رفع فيديو مسجل</h2> */}
<div className='upload'>
  <label htmlFor="file" className="custom-file-upload">
    <div className="icon">
      <svg viewBox="0 0 24 24" fill="#007BFF" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 10.5V7C17 5.34 15.66 4 14 4H5C3.34 4 2 5.34 2 7V17C2 18.66 3.34 20 5 20H14C15.66 20 17 18.66 17 17V13.5L21 16V8L17 10.5Z" />
      </svg>
    </div>
    <div className="text">
      {/* <span className='input-text'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
                style={{
                  marginRight: "8px",                  
                }}
        >
          <path d="M17 10.5V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z" />
        </svg>  
        اختر فيديو للترجمة
      </span> */}
        <span className='input-text'>
      <i className="fas fa-video" style={{ marginRight: "8px" }}></i>
      اختر فيديو للترجمة
    </span>

    </div>
    <input 
      id="file" 
      type="file" 
      accept="video/*" 
      onChange={handleFileChange} 
    />
  </label>

  {file && (
    <div className="file-name">
      {file.name}
    </div>
  )}

  <button className="btn-17" onClick={handleUpload}>
    <span className="text-container">
      <span className="text">🎬 رفع وترجمة</span>
    </span>
  </button>
</div>

      <TranslatedTextDisplay />

    </div>
  );
};

export default VideoUpload;
