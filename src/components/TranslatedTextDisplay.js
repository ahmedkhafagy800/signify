// TranslatedTextDisplay.js
import React from 'react';
import useStore from '../store';

const TranslatedTextDisplay = () => {
  const { translatedText, resetTranslatedText } = useStore();

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h3>النص المترجم:</h3>
      {translatedText.length === 0 ? (
        <p>سيظهر النص هنا بعد الترجمة...</p>
      ) : (
        translatedText.map((text, index) => <span key={index}>{text} </span>)
          )}
          <br></br>
          <br></br>
      <button onClick={resetTranslatedText}>مسح الترجمات</button>
    </div>
  );
};

export default TranslatedTextDisplay;
