import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../store';
import './TranslatedTextDisplay.css';

const TranslatedTextDisplay = ({ isDarkMode, onToggleDarkMode, sessionId }) => {
  const location = useLocation();
  const { translatedText, resetTranslatedText, popTranslatedText } = useStore();
  const combinedText = translatedText.join(' ');
  const [targetLanguage, setTargetLanguage] = useState('en'); 
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([{ code: 'en', name: 'English' }]);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    resetTranslatedText();
  }, [location.pathname, resetTranslatedText]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
        const availableLanguages = Object.entries(data.tl || {}).map(([code, name]) => ({ code, name }));
        setLanguages(availableLanguages.length > 0 ? availableLanguages : [{ code: 'en', name: 'English' }]);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!combinedText) return;
    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();
      setTranslation(data[0].map(item => item[0]).join(' '));
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);
 const handleSpeak = (text, lang) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const selectedVoice = voices.find(voice => voice.lang.startsWith(lang)) || voices.find(voice => voice.lang.includes('ar'));
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = async () => {
    console.log('حذف الترجمة button clicked: resetting sentence.');
    resetTranslatedText();
    try {
      const headers = {};
      if (sessionId) headers['X-Session-Id'] = sessionId;
      await fetch('http://127.0.0.1:8000/reset_sentence', { method: 'POST', headers });
    } catch (error) {
      console.error('Error resetting sentence on backend:', error);
    }
  };

  return (
    <div className={`translated-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <h3 className='label'>:النص المترجم</h3>
      {translatedText.length === 0 ? (
        <p className='placeholder-text'>سيظهر النص هنا بعد الترجمة...</p>
      ) : (
        <div className={`translated-result ${isDarkMode ? 'dark-mode-result' : ''}`}>
          <p className={`translated-text ${isDarkMode ? 'dark-mode-text' : ''}`}>{combinedText}</p>
          <button className={`btn-17 ${isDarkMode ? 'dark-mode-button' : ''}`} onClick={() => handleSpeak(combinedText, 'ar-SA')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -5 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg> تشغيل الصوت
          </button>
        </div>
      )}
      

      
      <button className={`btn-17 ${isDarkMode ? 'dark-mode-button' : ''}`} onClick={handleReset} disabled={translatedText.length === 0}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -2 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg> حذف الترجمة
      </button>

      <div className='language-selector'>
        <h3 htmlFor='targetLanguage' className='label'>: اختر اللغة</h3>
        <select id='targetLanguage' className={`select ${isDarkMode ? 'dark-mode-select' : ''}`} value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      
      <button className={`btn-17 ${isDarkMode ? 'dark-mode-button' : ''}`} onClick={handleTranslate} disabled={loading || !combinedText}>
        {loading ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader">
          <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -2 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>} {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
      </button>
      
      {translation && (
        <div className={`translated-result ${isDarkMode ? 'dark-mode-result' : ''}`}>
          <h3 className={`translated-text ${isDarkMode ? 'dark-mode-text' : ''}`}>النص المترجم:</h3>
          <p className={`translated-text ${isDarkMode ? 'dark-mode-text' : ''}`}>{translation}</p>
          {/* <button className={`btn-17 ${isDarkMode ? 'dark-mode-button' : ''}`} onClick={() => handleSpeak(translation, targetLanguage)}>
            <svg xmlns="http://www.w3.org/2000/svg" onClick={() => handleSpeak(translation, targetLanguage)}
              width="24" height="24" viewBox="0 -5 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2">
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
              <path d="M16 9a5 5 0 0 1 0 6" />
              <path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg> تشغيل الصوت
          </button> */}
<svg xmlns="http://www.w3.org/2000/svg" onClick={() => handleSpeak(translation, targetLanguage)}
              width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2">
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
              <path d="M16 9a5 5 0 0 1 0 6" />
              <path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg>




        </div>
      )}
    </div>
  );
};

export default TranslatedTextDisplay;
