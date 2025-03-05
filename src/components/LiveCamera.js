import React, { useRef, useEffect } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';
import './LiveCamera.css'; 

const LiveCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { appendTranslatedText } = useStore();
    const intervalId = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        appendTranslatedText("كيف حالك؟");          
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
        intervalId.current = setInterval(captureAndSendFrame, 500);

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
        

        canvas.toBlob(async (blob) => {
            if (blob) {
                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg'); 
                for (let pair of formData.entries()) {
                    console.log(pair[0], pair[1]); 
                }
                try {
                    const response = await fetch('http://127.0.0.1:8000/predict', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    appendTranslatedText(data.fingers_count);
                    // appendTranslatedText("كيف حالك؟");
                } catch (error) {
                    console.error('Error sending frame:', error);
                }
            }
        }, 'image/jpeg');
    };
    
    return (
        <div className="live-camera-container">
            <h2>📷ترجمة فورية</h2>
            <video ref={videoRef} autoPlay className="video-stream" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <TranslatedTextDisplay />
        </div>
    );
};

export default LiveCamera;