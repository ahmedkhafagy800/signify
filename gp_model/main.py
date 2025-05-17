from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
except ImportError as e:
    print(f"Error importing TensorFlow modules: {e}")
    exit(1)
import mediapipe as mp
import os
from utils import mediapipe_detection, extract_keypoints
# Load MediaPipe holistic model


# Path to dataset
dataset_path = "./Processed_Data/"

# Get list of labels (assuming each class has its own folder)
labels = sorted(os.listdir(dataset_path))

# Convert to numpy array
actions = np.array(labels)


app = FastAPI()

model = tf.keras.models.load_model("final_action_model.keras")

mp_holistic = mp.solutions.holistic

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/predict/")
async def predict_sign(file: UploadFile = File(...)):
    """Process uploaded image and predict sign language gesture"""
    
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Process image
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        image, results = mediapipe_detection(image, holistic)
        keypoints = extract_keypoints(results)
    
    # Ensure keypoints match input shape
    if keypoints.shape[0] != 258:
        return {"error": "Invalid keypoints shape"}

    # Make prediction
    keypoints = np.expand_dims(keypoints, axis=0)
    prediction = model.predict(keypoints)
    predicted_label = actions[np.argmax(prediction)]

    return {"predicted_sign": predicted_label}

# Run FastAPI server with:
# uvicorn main:app --reload
