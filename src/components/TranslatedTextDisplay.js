import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../store';
import './TranslatedTextDisplay.css';

const TranslatedTextDisplay = () => {
  const location = useLocation();
  const { translatedText, resetTranslatedText, popTranslatedText } = useStore();
  const combinedText = translatedText.join(' ');

  const [targetLanguage, setTargetLanguage] = useState('en'); 
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    resetTranslatedText();
  }, [location.pathname, resetTranslatedText]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
        const availableLanguages = data.tl || {};

        const formattedLanguages = Object.entries(availableLanguages).map(([code, name]) => ({
          code,
          name
        }));

        setLanguages(formattedLanguages);
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const translatedText = data[0].map(item => item[0]).join(' ');
      setTranslation(translatedText);
    } catch (error) {
      console.error('حدث خطأ أثناء الترجمة:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSpeak = (text, lang) => {
  if (!text) return;

  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang.startsWith(lang));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }
};



  return (
    <div className="translated-container">
      <h3 className='label'>:النص المترجم</h3>
      {translatedText.length === 0 ? (
        <p className="placeholder-text">سيظهر النص هنا بعد الترجمة...</p>
      ) : (
        <div>
            <p className="translated-text">{combinedText}</p>
          <button className="btn-17" onClick={() => handleSpeak(combinedText, 'ar-SA')}>
            <span className="text-container">
              <span className="text"><i className="fas fa-volume-up"></i> تشغيل الصوت</span>
            </span>
          </button>
        </div>
      )}
      
      <button className="btn-17" onClick={popTranslatedText} disabled={translatedText.length === 0}>
        <span className="text-container">
          <span className="text"><i className="fas fa-backspace"></i> حذف اخر كلمه</span>
        </span>
      </button>
      
      <button className="btn-17" onClick={resetTranslatedText} disabled={translatedText.length === 0}>
        <span className="text-container">
          <span className="text"><i className="fas fa-eraser"></i> مسح الترجمات</span>
        </span>
      </button>
      
      <div className="language-selector">
        <label htmlFor="targetLanguage" className='label'>: اختر اللغة</label>
        <select id="targetLanguage" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          {languages.length > 0 ? (
            languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))
          ) : (
            <option value="en">الإنجليزية</option>
          )}
        </select>
      </div>
      
      <button className="btn-17" onClick={handleTranslate} disabled={loading || !combinedText}>
        <span className="text-container">
          <span className="text">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-language"></i>} {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
          </span>
        </span>
      </button>
      
      {translation && (
        <div className="translated-result">
          <h3 className='translation-result'>النص المترجم:</h3>
          <p className='translation-result'>{translation}</p>
          <button className="btn-17" onClick={() => handleSpeak(translation, targetLanguage)}>
            <span className="text-container">
              <span className="text"><i className="fas fa-volume-up"></i> تشغيل الصوت</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TranslatedTextDisplay;
