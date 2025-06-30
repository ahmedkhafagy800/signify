import cv2
import numpy as np
import torch
import torch.nn as nn
import mediapipe as mp
from PIL import ImageFont, ImageDraw, Image
import arabic_reshaper
from bidi.algorithm import get_display

# ----------- Model Definition (CTNet) -----------
class CTNet(nn.Module):
    def __init__(self, input_dim=1629, hidden_dim=256, num_classes=13):
        super(CTNet, self).__init__()
        self.conv1 = nn.Conv1d(input_dim, hidden_dim, kernel_size=3, padding=1)
        self.bn = nn.BatchNorm1d(hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)
        self.attn = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.relu(self.bn(self.conv1(x)))
        x = x.permute(0, 2, 1)
        x, _ = self.attn(x, x, x)
        x = self.dropout(x)
        x = x.permute(0, 2, 1)
        x = self.pool(x).squeeze(-1)
        return self.fc(x)

# ----------- Keypoint Extraction -----------
def extract_keypoints_from_frame(frame, holistic):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image)

    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]) if results.face_landmarks else np.zeros((468, 3))
    pose = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]) if results.pose_landmarks else np.zeros((33, 3))
    left = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]) if results.left_hand_landmarks else np.zeros((21, 3))
    right = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]) if results.right_hand_landmarks else np.zeros((21, 3))

    hand_present = left.any() or right.any()
    return np.concatenate([face, pose, left, right], axis=0).flatten(), hand_present

# ----------- Pad/Truncate -----------
def pad_or_truncate(seq, max_len=40):
    T, D = seq.shape
    if T < max_len:
        pad = np.zeros((max_len - T, D))
        return np.vstack([seq, pad])
    return seq[:max_len]

# ----------- Draw Arabic Text -----------
def draw_arabic_text(frame, text, position, font_path='arial.ttf', font_size=32):
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    img_pil = Image.fromarray(frame)
    draw = ImageDraw.Draw(img_pil)
    try:
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
    draw.text(position, bidi_text, font=font, fill=(0, 255, 0))
    return np.array(img_pil)

# ----------- Label Map -----------
label_map = [
    'الاثنين', 'الاحد', 'الاربعاء', 'الثلاثاء', 'الجمعه',
    'الخميس', 'السبت', 'السلام عليكم', 'انا', 'شهاده ميلاد',
    'عاوز', 'قيد', 'يوم'
]

# ----------- Load Model -----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CTNet(input_dim=1629, hidden_dim=256, num_classes=len(label_map)).to(device)
model.load_state_dict(torch.load("best_ctnet_model86%over.pth", map_location=device))
model.eval()

if __name__ == "__main__":
    mp_holistic = mp.solutions.holistic
    cap = cv2.VideoCapture(0)
    sequence = []
    confidence_threshold = 0.85
    last_probs = None
    display_counter = 0
    DISPLAY_FRAMES = 30
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            keypoints, hand_present = extract_keypoints_from_frame(frame, holistic)
            if hand_present:
                sequence.append(keypoints)
                if len(sequence) == 30:
                    seq_np = np.array(sequence)
                    seq_np = pad_or_truncate(seq_np, 30)
                    input_tensor = torch.tensor(seq_np, dtype=torch.float32).unsqueeze(0).to(device)
                    with torch.no_grad():
                        preds = model(input_tensor)
                        probs = torch.softmax(preds, dim=1).cpu().numpy()[0]
                    last_probs = probs
                    display_counter = DISPLAY_FRAMES
                    sequence = []
            else:
                sequence.clear()
            if last_probs is not None and display_counter > 0:
                y0 = 30
                for i, prob in enumerate(last_probs):
                    label = label_map[i]
                    conf_percent = f"{prob * 100:.1f}%"
                    display_text = f"{label} ({conf_percent})"
                    frame = draw_arabic_text(frame, display_text, (20, y0), font_path='arial.ttf', font_size=28)
                    y0 += 40
                display_counter -= 1
            cv2.imshow('🎥 Live Prediction (CTNet)', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    cap.release()
    cv2.destroyAllWindows()
