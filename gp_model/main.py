from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import mediapipe as mp
from utils import mediapipe_detection, extract_keypoints

# Load MediaPipe holistic model
mp_holistic = mp.solutions.holistic

# Load trained model
model = load_model("action.h5")
actions = np.array(['hello', 'thanks', 'iloveyou'])
threshold = 0.8

app = FastAPI()



from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read image from uploaded file
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Process the frame
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            image, results = mediapipe_detection(frame, holistic)
            keypoints = extract_keypoints(results)

        # Predict sign language gesture
        res = model.predict(np.expand_dims([keypoints] * 30, axis=0))[0]
        predicted_action = actions[np.argmax(res)]
        confidence = res[np.argmax(res)]

        if confidence > threshold:
            return {"sign": predicted_action, "confidence": float(confidence)}
        else:
            return {"sign": "unknown", "confidence": float(confidence)}

    except Exception as e:
        return {"error": str(e)}

# Run FastAPI server with:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
