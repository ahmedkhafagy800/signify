
//     import React, { useState, useEffect } from 'react';
//     import useStore from '../store';
//     import './TranslatedTextDisplay.css';
//     const TranslatedTextDisplay = () => {
//     const { translatedText, resetTranslatedText ,popTranslatedText} = useStore();
//     const combinedText = translatedText.join(' '); 
//     // const combinedText = translatedText.join(' '); 

//     const [targetLanguage, setTargetLanguage] = useState('en'); 
//     const [translation, setTranslation] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [languages, setLanguages] = useState([]);

//     useEffect(() => {
//     const fetchLanguages = async () => {
//         try {
//         const response = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
//         if (!response.ok) throw new Error('Failed to fetch languages');
//         const data = await response.json();
//             console.log(data.tl);
//         const availableLanguages = data.tl || {};

//         const formattedLanguages = Object.entries(availableLanguages).map(([code, name]) => ({
//             code,
//             name
//         }));

//         setLanguages(formattedLanguages);
//         } catch (error) {
//         console.error('Error fetching languages:', error);
//         }
//     };
//     fetchLanguages();
//     }, []);

//     const handleTranslate = async () => {
//         if (!combinedText) return;
//         setLoading(true);
//       try {
          
//         const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`;
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         setTranslation(data[0].map(item => item[0]).join(' '));
//         } catch (error) {
//         console.error('حدث خطأ أثناء الترجمة:', error);
//         } finally {
//         setLoading(false);
//         }
//     };

// return (
//     <div className="translated-container">
//       <h3 className='label'>:النص المترجم</h3>
//       {translatedText.length === 0 ? (
//         <p className="placeholder-text">سيظهر النص هنا بعد الترجمة...</p>
//       ) : (
//         <p className="translated-text">{combinedText}</p>
//       )}
//       <button className="pop-button but" onClick={popTranslatedText} disabled={translatedText.length === 0}>حذف اخر كلمه</button>
//       <button className="reset-button but" onClick={resetTranslatedText} disabled={translatedText.length === 0}>مسح الترجمات</button>
//       <div className="language-selector">
//         <label htmlFor="targetLanguage" className='label'> : اختر اللغة </label>
//        <select 
//   id="targetLanguage"
//   value={targetLanguage}
//   onChange={(e) => setTargetLanguage(e.target.value)}
// >
//   {languages.length > 0 ? (
//     languages.map(lang => (
//       <option key={lang.code} value={lang.code}>{lang.name}</option>
//       ))
//       ) : (
//     <option value="en">الإنجليزية</option>
//     )}
//       </select>
       

//       </div>
//       <button className="translate-button" onClick={handleTranslate} disabled={loading || !combinedText}>
//         {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
//       </button>
//       {translation && (
//         <div className="translated-result">
//           <h3>النص المترجم:</h3>
//           <p>{translation}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TranslatedTextDisplay;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // استيراد useLocation
import useStore from '../store';
import './TranslatedTextDisplay.css';

const TranslatedTextDisplay = () => {
  const location = useLocation(); // الحصول على معلومات المسار الحالي
  const { translatedText, resetTranslatedText, popTranslatedText } = useStore();
  const combinedText = translatedText.join(' ');

  const [targetLanguage, setTargetLanguage] = useState('en'); 
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);

  // استخدم useEffect لمراقبة تغيير المسار وإعادة تعيين النص
  useEffect(() => {
    resetTranslatedText();
  }, [location.pathname, resetTranslatedText]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
        console.log(data.tl);
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
      setTranslation(data[0].map(item => item[0]).join(' '));
    } catch (error) {
      console.error('حدث خطأ أثناء الترجمة:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translated-container">
      <h3 className='label'>:النص المترجم</h3>
      {translatedText.length === 0 ? (
        <p className="placeholder-text">سيظهر النص هنا بعد الترجمة...</p>
      ) : (
        <p className="translated-text">{combinedText}</p>
      )}
<button class="btn-17" onClick={popTranslatedText} disabled={translatedText.length === 0}>
  <span class="text-container">
    <span class="text">        حذف اخر كلمه
</span>
  </span>
</button>

      {/* <button className="pop-button but" onClick={popTranslatedText} disabled={translatedText.length === 0}>
        حذف اخر كلمه
      </button> */}
      <button class="btn-17" onClick={resetTranslatedText} disabled={translatedText.length === 0}>
  <span class="text-container">
    <span class="text">        مسح الترجمات
</span>
  </span>
</button>
     
      <div className="language-selector">
        <label htmlFor="targetLanguage" className='label'> : اختر اللغة </label>
        <select 
          id="targetLanguage"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {languages.length > 0 ? (
            languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))
          ) : (
            <option value="en">الإنجليزية</option>
          )}
        </select>
      </div>
      <button class="btn-17" onClick={handleTranslate} disabled={loading || !combinedText}>
        <span class="text-container">
          <span class="text">{loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
</span>
        </span>
      </button>

      {/* <button className="translate-button" onClick={handleTranslate} disabled={loading || !combinedText}>
        {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
      </button> */}
      {translation && (
        <div className="translated-result">
          <h3>النص المترجم:</h3>
          <p>{translation}</p>
        </div>
      )}
    </div>
  );
};

export default TranslatedTextDisplay;
