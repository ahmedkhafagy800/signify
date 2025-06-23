from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import torch
from collections import deque
import uuid
from typing import Dict

# Import model and utils from test_realtime.py
from test_realtime import CNN1DSignLangModel, idx2label, extract_keypoints_from_frame

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CNN1DSignLangModel(input_dim=1629, num_classes=len(idx2label))
model.load_state_dict(torch.load("best_model77%.pt", map_location=device))
model.to(device)
model.eval()

# Store a sequence buffer per session
session_buffers: Dict[str, deque] = {}
SEQUENCE_LENGTH = 30

@app.post("/predict")
async def predict(request: Request, file: UploadFile = File(...)):
    # Get or create a session ID
    session_id = request.headers.get("X-Session-Id")
    if not session_id:
        session_id = str(uuid.uuid4())
    if session_id not in session_buffers:
        session_buffers[session_id] = deque(maxlen=SEQUENCE_LENGTH)
    sequence = session_buffers[session_id]

    # Read image from request
    image_bytes = await file.read()
    npimg = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    frame = cv2.flip(frame, 1)  # Mirror if needed

    # Preprocess and extract keypoints
    keypoints = extract_keypoints_from_frame(frame)
    if np.all(keypoints == 0):
        return {"sign": "لا يوجد إشارة واضحة", "session_id": session_id}

    sequence.append(keypoints)

    if len(sequence) == SEQUENCE_LENGTH:
        input_data = np.array(sequence)
        input_tensor = torch.tensor(input_data, dtype=torch.float32).unsqueeze(0).to(device)
        with torch.no_grad():
            output = model(input_tensor)
            pred_class = torch.argmax(output, dim=1).item()
            pred_label = idx2label[pred_class]
        return {"sign": pred_label, "session_id": session_id}
    else:
        return {"sign": "...", "session_id": session_id}  # Not enough frames yet 