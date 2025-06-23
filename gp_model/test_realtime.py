# version 2
import cv2
import torch
import numpy as np
import mediapipe as mp
from collections import deque
from PIL import ImageFont, ImageDraw, Image
import arabic_reshaper
from bidi.algorithm import get_display
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# تحميل النموذج
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class CNN1DSignLangModel(torch.nn.Module):
    def __init__(self, input_dim=1629, num_classes=8, dropout=0.3):
        super().__init__()
        self.conv = torch.nn.Sequential(
            torch.nn.Conv1d(input_dim, 256, kernel_size=3, padding=1),
            torch.nn.ReLU(),
            torch.nn.BatchNorm1d(256),
            torch.nn.Dropout(dropout),
            torch.nn.Conv1d(256, 128, kernel_size=3, padding=1),
            torch.nn.ReLU(),
            torch.nn.AdaptiveAvgPool1d(1),
        )
        self.fc = torch.nn.Sequential(
            torch.nn.Flatten(),
            torch.nn.Linear(128, 64),
            torch.nn.ReLU(),
            torch.nn.Dropout(dropout),
            torch.nn.Linear(64, num_classes)
        )

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.conv(x)
        return self.fc(x)

label2idx = {'الاثنين': 0, 'الاحد': 1, 'الاربعاء': 2, 'الثلاثاء': 3, 'الجمعه': 4, 'الخميس': 5, 'السبت': 6,
             'السلام عليكم': 7, 'انا': 8, 'شهاده ميلاد': 9, 'عاوز': 10, 'قيد': 11, 'يوم': 12}
idx2label = {v: k for k, v in label2idx.items()}
num_classes = len(label2idx)

model = CNN1DSignLangModel(input_dim=1629, num_classes=num_classes)
model.load_state_dict(torch.load("best_model77%.pt", map_location=device))
model.to(device)
model.eval()

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(static_image_mode=False, min_detection_confidence=0.4, min_tracking_confidence=0.4)

# Preload font once
FONT_PATH = "Amiri-Regular.ttf"
FONT_SIZE = 32
if os.path.exists(FONT_PATH):
    try:
        ARABIC_FONT = ImageFont.truetype(FONT_PATH, FONT_SIZE)
    except OSError:
        print(f"[ERROR] Could not load font at '{FONT_PATH}'. Using default font. Arabic may not display correctly.")
        ARABIC_FONT = ImageFont.load_default()
else:
    print(f"[ERROR] Font file '{FONT_PATH}' not found. Using default font. Arabic may not display correctly.")
    ARABIC_FONT = ImageFont.load_default()

def extract_keypoints_from_frame(frame):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image)

    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]) if results.face_landmarks else np.zeros((468, 3))
    pose = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]) if results.pose_landmarks else np.zeros((33, 3))
    left = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]) if results.left_hand_landmarks else np.zeros((21, 3))
    right = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]) if results.right_hand_landmarks else np.zeros((21, 3))

    return np.concatenate([face, pose, left, right]).flatten()

def draw_arabic_text(frame, text, position=(10, 40)):
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    img_pil = Image.fromarray(frame)
    draw = ImageDraw.Draw(img_pil)
    draw.text(position, bidi_text, font=ARABIC_FONT, fill=(0, 255, 0))
    return np.array(img_pil)

if __name__ == "__main__":
    sequence = deque(maxlen=60)
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)  # Faster on Windows

    frame_skip = 1  # Process every frame; set to 2 or 3 to process every 2nd/3rd frame for more speed
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        # Resize for faster processing (optional, e.g., 640x360)
        frame_small = cv2.resize(frame, (640, 360))

        frame_count += 1
        if frame_count % frame_skip != 0:
            cv2.imshow('مترجم لغة الإشارة', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue

        keypoints = extract_keypoints_from_frame(frame_small)

        if np.all(keypoints == 0):
            cv2.imshow('مترجم لغة الإشارة', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue

        sequence.append(keypoints)

        if len(sequence) == 60:
            input_data = np.array(sequence)
            input_tensor = torch.tensor(input_data, dtype=torch.float32).unsqueeze(0).to(device)
            with torch.no_grad():
                output = model(input_tensor)
                pred_class = torch.argmax(output, dim=1).item()
                pred_label = idx2label[pred_class]

            print("الإشارة:", pred_label)
            frame = draw_arabic_text(frame, f"الإشارة: {pred_label}", position=(10, 30))

        cv2.imshow('مترجم لغة الإشارة', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
