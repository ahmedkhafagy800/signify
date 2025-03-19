import React, { useRef, useEffect, useState } from 'react';
import useStore from '../store';
import TranslatedTextDisplay from './TranslatedTextDisplay';
import './LiveCamera.css'; 

const LiveCamera = ({ isDarkMode, onToggleDarkMode }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { appendTranslatedText } = useStore();
    const streamRef = useRef(null);
    const intervalId = useRef(null);    
    const [facingMode, setFacingMode] = useState('user'); 
    // const [currentAction, setCurrentAction] = useState(""); // Store current action

    useEffect(() => {
        appendTranslatedText("كيف حالك؟");          
        // setCurrentAction("كيف حالك؟");  // Set initial action
        startCamera(facingMode);
        intervalId.current = setInterval(captureAndSendFrame, 200);

        return () => {
            stopCamera();
            clearInterval(intervalId.current);
        };
    }, [facingMode]); 

    const startCamera = async (mode) => {
        stopCamera(); 

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: mode }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const toggleCamera = () => {
        setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
    };

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
                try {
                    const response = await fetch('http://127.0.0.1:8000/predict', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    appendTranslatedText(data.sign);
                    // setCurrentAction(data.sign); // Update current action
                } catch (error) {
                    console.error('Error sending frame:', error);
                }
            }
        }, 'image/jpeg');
    };

    return (
        <div className="live-camera-container">{/*}
            <h2>الحركة الحالية: {currentAction || "لا يوجد حركة"}</h2> {/* Display current action */} 
            <div className="camera-frame">
                <button className="toggle-camera-btn" onClick={toggleCamera}>
                    🔄
                </button>
                <video ref={videoRef} autoPlay className="video-stream" />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <TranslatedTextDisplay isDarkMode={isDarkMode} onToggle={onToggleDarkMode}/>
        </div>
    );
};

export default LiveCamera;
