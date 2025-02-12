// LiveCamera.js
import React, { useRef, useEffect } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';
import LibraTranslator from './LibraTranslator';

const LiveCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    // استخدام appendTranslatedText بدلاً من setTranslatedText
    const { appendTranslatedText } = useStore();
    const intervalId = useRef(null);
    const streamRef = useRef(null); 

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        };

    startCamera();

    // التقاط الإطار كل ثانية
    intervalId.current = setInterval(captureAndSendFrame, 1000);

    // دالة التنظيف عند إلغاء تركيب المكون
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
      clearInterval(intervalId.current);
      setTimeout(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
            console.log("✅ تم تحرير الكاميرا بنجاح");
          })
          .catch((err) => console.warn("⚠️ Error resetting media stream:", err));
      }, 10);
    };
  }, []);

  const captureAndSendFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
        appendTranslatedText("احبك يا عزيزتي");

    canvas.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');

        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          // إضافة الترجمة الجديدة إلى الترجمات الموجودة
          appendTranslatedText(data.translatedText);
          appendTranslatedText("ازيك");
        } catch (error) {
          console.error('Error sending frame:', error);
        }
      }
    }, 'image/jpeg');
  };

    return (
        <div>
            
            <h2>ترجمة فورية</h2>
            <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '600px' }} />
            {/* العنصر canvas يُستخدم فقط لالتقاط الإطارات */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <TranslatedTextDisplay />
            <LibraTranslator />

        </div>
        );
    };

export default LiveCamera;
