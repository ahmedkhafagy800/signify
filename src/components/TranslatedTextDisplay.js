// src/components/TranslatedTextDisplay.js
import React from 'react';
import useStore from '../store';

const TranslatedTextDisplay = () => {
    const { translatedText } = useStore();

    return (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>النص المترجم:</h3>
        <p>{translatedText || 'سيظهر النص هنا بعد الترجمة...'}</p>
        </div>
    );
};

export default TranslatedTextDisplay;
