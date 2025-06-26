import React, { useState } from 'react';
import useStore from '../store';
import './VideoUpload.css';
import TranslatedTextDisplay from './TranslatedTextDisplay';

const VideoUpload = ({ isDarkMode, onToggleDarkMode }) => {
  const [file, setFile] = useState(null);
  const { appendTranslatedText, resetTranslatedText } = useStore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('يرجى اختيار فيديو أولاً');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/predict_video', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Backend response:', data);
      if (data.translation) {
        resetTranslatedText();
        appendTranslatedText(data.translation);
      } else {
        alert('لم يتم التعرف على أي إشارات في الفيديو.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('حدث خطأ أثناء رفع الفيديو أو الترجمة.');
    }
  };

  return (
    <div className={`video-upload-container${isDarkMode ? ' dark-mode' : ''}`}>
<div className='upload'>
  <label htmlFor="file" className="custom-file-upload">
    <div className="icon">
      <svg viewBox="0 0 24 24" fill="#007BFF" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 10.5V7C17 5.34 15.66 4 14 4H5C3.34 4 2 5.34 2 7V17C2 18.66 3.34 20 5 20H14C15.66 20 17 18.66 17 17V13.5L21 16V8L17 10.5Z" />
      </svg>
    </div>
    <div className="text">
     
        <span className='input-text'>
              <svg xmlns="http://www.w3.org/2000/svg" width="40"
                height="30" viewBox="0 -5 24 24" fill="none"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" />
              </svg>     اضغط لاختيار فيديو
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

  <button className={`btn-17 ${isDarkMode ?'dark-mode-button' : ''}`} onClick={handleUpload}>
    <span className="text-container">
            <span className={`text`}>🎬 رفع وترجمة</span>
    </span>
  </button>
</div>

      <TranslatedTextDisplay isDarkMode={isDarkMode} onToggle={onToggleDarkMode}/>

    </div>
  );
};

export default VideoUpload;
