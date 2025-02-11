
import React, { useRef, useEffect } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';

const LiveCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { setTranslatedText } = useStore();
    const intervalId = useRef(null);
    const streamRef = useRef(null); 

    useEffect(() => {
        const startCamera = async () =>
        {
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

        // دالة التنظيف: عند خروج المكون نتأكد من إيقاف التيار وإلغاء المؤقت
        return () =>
        {
            console.log("🔴 تنفيذ دالة التنظيف في VideoRecord");

            console.log("LiveCamera unmounting: stopping camera");
            if (streamRef.current)
            {
                streamRef.current.getTracks().forEach((track) =>
                {
                    console.log("قبل الإيقاف: track.readyState =", track.readyState);
                    track.stop();
                    console.log("بعد الإيقاف: track.readyState =", track.readyState);
                });
                
                streamRef.current = null;
            }
            if (videoRef.current)
            {
                videoRef.current.srcObject = null;
                videoRef.current.removeAttribute("src");
                videoRef.current.load();
            }
            clearInterval(intervalId.current);
            setTimeout(() =>
            {
                navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    stream.getTracks().forEach((track) => track.stop());
                    console.log("✅ تم تحرير الكاميرا بنجاح");
                })
                .catch((err) => console.warn("⚠️ Error resetting media stream:", err));
            }, 10);
            };

}, []);

    const captureAndSendFrame = async () =>
    {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) =>
        {
            if (blob)
            {
                const formData = new FormData();
                formData.append('frame', blob, 'frame.jpg');

                try
                {
                    const response = await fetch('/api/translate', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    setTranslatedText(data.translatedText);
                }
                catch (error) {
                    console.error('Error sending frame:', error);
                }
            }
        }, 'image/jpeg');
    };

    return(
        <div>
            <h2>ترجمة فورية</h2>
            <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '600px' }} />
            {/* for canvas frame by frame */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <TranslatedTextDisplay />
        </div>
    );
};

export default LiveCamera;
