// LibraTranslator.js
import React, { useState } from 'react';
import useStore from '../store';

const LibraTranslator = () => {
  const { translatedText } = useStore();
  const currentText = translatedText[translatedText.length - 1] || '';

  const [targetLanguage, setTargetLanguage] = useState('en'); // اللغة الافتراضية: الإنجليزية
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!currentText) return;
    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(currentText)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTranslation(data[0].map(item => item[0]).join(''));
    } catch (error) {
      console.error('حدث خطأ أثناء الترجمة:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h3>النص الأصلي (العربي):</h3>
      <p>{currentText || 'لا يوجد نص للترجمة'}</p>

        <div style={{ margin: '10px 0' }}>
        <label htmlFor="targetLanguage">اختر اللغة:</label>
        <select 
            id="targetLanguage"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{ marginLeft: '10px' }}
        >
            <option value="en">الإنجليزية</option>
            <option value="fr">الفرنسية</option>
            <option value="de">الألمانية</option>
            <option value="es">الإسبانية</option>
        </select>
        </div>

        <button onClick={handleTranslate} disabled={loading || !currentText}>
        {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
        </button>

        {translation && (
        <div style={{ marginTop: '20px' }}>
            <h3>النص المترجم:</h3>
            <p>{translation}</p>
        </div>
        )}
    </div>
  );
};

export default LibraTranslator;
