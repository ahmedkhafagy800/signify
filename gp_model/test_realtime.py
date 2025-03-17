import cv2
import numpy as np
import mediapipe as mp
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import ImageFont, ImageDraw, Image

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
except ImportError as e:
    print(f"Error importing TensorFlow modules: {e}")
    exit(1)

from utils import mediapipe_detection, draw_styled_landmarks, extract_keypoints

actions = np.array(['اهلا', 'بحبك', 'شكرا'])
colors = [(245, 117, 16), (117, 245, 16), (16, 117, 245)]
threshold = 0.8

def put_arabic_text(img, text, position, font_size=32, color=(255, 255, 255)):
    """Render Arabic text on OpenCV image using PIL"""
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    img_pil = Image.fromarray(img)
    draw = ImageDraw.Draw(img_pil)
    font = ImageFont.truetype("arial.ttf", font_size)  # تأكد الخط بيدعم العربي
    draw.text(position, bidi_text, font=font, fill=color)
    return np.array(img_pil)

def prob_viz(res, actions, input_frame, colors):
    """Visualize prediction probabilities with Arabic support."""
    output_frame = input_frame.copy()
    img_pil = Image.fromarray(output_frame)
    draw = ImageDraw.Draw(img_pil)
    font = ImageFont.truetype("arial.ttf", 24)  # تأكد ان الخط ده عندك

    for num, prob in enumerate(res):
        # Create rectangle
        cv2.rectangle(output_frame, (0, 60 + num * 40), (int(prob * 640), 90 + num * 40), colors[num], -1)

        # Handle Arabic text reshaping and bidi
        reshaped_text = arabic_reshaper.reshape(actions[num])
        bidi_text = get_display(reshaped_text)

        # Render text using PIL
        draw.text((10, 60 + num * 40), f"{bidi_text} - {prob:.2f}", font=font, fill=(255, 255, 255))

    output_frame = np.array(img_pil)
    return output_frame

def test_realtime():
    model = load_model('action.h5')
    print("Model loaded successfully.")
    sequence = []
    current_action = ""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    with mp.solutions.holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            image, results = mediapipe_detection(frame, holistic)
            draw_styled_landmarks(image, results)
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]

            if len(sequence) == 30:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
                predicted_action = actions[np.argmax(res)]
                confidence = res[np.argmax(res)]
                if confidence > threshold:
                    current_action = predicted_action
                image = prob_viz(res, actions, image, colors)

            # Draw Arabic text
            image = cv2.rectangle(image, (0, 0), (640, 40), (245, 117, 16), -1)
            image = put_arabic_text(image, current_action, (10, 5), font_size=32, color=(255, 255, 255))

            cv2.imshow('Real-Time Action Recognition', image)
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_realtime()
