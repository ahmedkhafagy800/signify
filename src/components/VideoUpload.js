import React, { useState } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';

const VideoUpload = () => {
    const [file, setFile] = useState(null);
    const { setTranslatedText } = useStore();
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
    setTranslatedText(data.translatedText);
    } catch (error) {
        console.error('Error uploading video:', error);
    }
};

    return (
        <div>
            <h2>رفع فيديو مسجل</h2>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>رفع وترجمة</button>
            <TranslatedTextDisplay />
        </div>
    );
};

export default VideoUpload;
