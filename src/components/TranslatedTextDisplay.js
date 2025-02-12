    // import React, { useState } from 'react';
    // import useStore from '../store';

    // const TranslatedTextDisplay = () => {
    //   const { translatedText, resetTranslatedText } = useStore();
    //   const combinedText = translatedText.join(' '); // دمج جميع النصوص في المصفوفة

    //   const [targetLanguage, setTargetLanguage] = useState('en'); // اللغة الافتراضية: الإنجليزية
    //   const [translation, setTranslation] = useState('');
    //   const [loading, setLoading] = useState(false);

    //   const handleTranslate = async () => {
    //     if (!combinedText) return;
    //     setLoading(true);
    //     try {
    //       const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`;
    //       const response = await fetch(url);
    //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    //       const data = await response.json();
    //       setTranslation(data[0].map(item => item[0]).join(' '));
    //     } catch (error) {
    //       console.error('حدث خطأ أثناء الترجمة:', error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   return (
    //     <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
    //       <h3>النص المترجم:</h3>
    //       {translatedText.length === 0 ? (
    //         <p>سيظهر النص هنا بعد الترجمة...</p>
    //       ) : (
    //         <p>{combinedText}</p>
    //       )}
    //       <br /><br />
    //       <button onClick={resetTranslatedText}>مسح الترجمات</button>
    //       <br /><br />
    //       <div style={{ margin: '10px 0' }}>
    //         <label htmlFor="targetLanguage">اختر اللغة:</label>
    //         <select 
    //           id="targetLanguage"
    //           value={targetLanguage}
    //           onChange={(e) => setTargetLanguage(e.target.value)}
    //           style={{ marginLeft: '10px' }}
    //         >
    //           <option value="en">الإنجليزية</option>
    //           <option value="fr">الفرنسية</option>
    //           <option value="de">الألمانية</option>
    //           <option value="es">الإسبانية</option>
    //         </select>
    //       </div>
    //       <button onClick={handleTranslate} disabled={loading || !combinedText}>
    //         {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
    //       </button>
    //       {translation && (
    //         <div style={{ marginTop: '20px' }}>
    //           <h3>النص المترجم:</h3>
    //           <p>{translation}</p>
    //         </div>
    //       )}
    //     </div>
    //   );
    // };

    // export default TranslatedTextDisplay;
    // TranslatedTextDisplay.js
    import React, { useState, useEffect } from 'react';
    import useStore from '../store';
    import './TranslatedTextDisplay.css';
    const TranslatedTextDisplay = () => {
    const { translatedText, resetTranslatedText } = useStore();
    const combinedText = translatedText.join(' '); // دمج جميع النصوص في المصفوفة

    const [targetLanguage, setTargetLanguage] = useState('en'); // اللغة الافتراضية: الإنجليزية
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
    const fetchLanguages = async () => {
        try {
        const response = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
            console.log(data.tl);
        // استخراج قائمة اللغات المتاحة من `al.tl`
        const availableLanguages = data.tl || {};

        // تحويل الكائن إلى مصفوفة [ { code: "en", name: "English" }, ... ]
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
      <h3>النص المترجم:</h3>
      {translatedText.length === 0 ? (
        <p className="placeholder-text">سيظهر النص هنا بعد الترجمة...</p>
      ) : (
        <p className="translated-text">{combinedText}</p>
      )}
      <button className="reset-button" onClick={resetTranslatedText}>مسح الترجمات</button>
      <div className="language-selector">
        <label htmlFor="targetLanguage">اختر اللغة:</label>
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
      <button className="translate-button" onClick={handleTranslate} disabled={loading || !combinedText}>
        {loading ? 'جارٍ الترجمة...' : 'ترجم النص'}
      </button>
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