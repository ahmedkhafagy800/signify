import React, { useState } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';
import './VideoUpload.css'; // استيراد ملف CSS


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
      <h2 className="video-upload-title">رفع فيديو مسجل</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
      <button onClick={handleUpload} className="upload-button">رفع وترجمة</button>
      <TranslatedTextDisplay />
    </div>
  );
};

export default VideoUpload;
