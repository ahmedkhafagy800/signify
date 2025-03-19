import os
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

# 🟢 Load classes dynamically like in training
DATA_PATH = os.path.join('Process   ed_Data')
actions = np.array(sorted([d for d in os.listdir(DATA_PATH) if os.path.isdir(os.path.join(DATA_PATH, d))]))
colors = [(245, 117, 16), (117, 245, 16), (16, 117, 245), (255, 0, 0), (0, 255, 255)]
threshold = 0.8

def put_arabic_text(img, text, position, font_size=32, color=(255, 255, 255)):
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    img_pil = Image.fromarray(img)
    draw = ImageDraw.Draw(img_pil)
    font = ImageFont.truetype("arial.ttf", font_size)
    draw.text(position, bidi_text, font=font, fill=color)
    return np.array(img_pil)

def prob_viz(res, actions, input_frame, colors):
    output_frame = input_frame.copy()
    img_pil = Image.fromarray(output_frame)
    draw = ImageDraw.Draw(img_pil)
    font = ImageFont.truetype("arial.ttf", 24)

    for num, prob in enumerate(res):
        cv2.rectangle(output_frame, (0, 60 + num * 40), (int(prob * 640), 90 + num * 40), colors[num % len(colors)], -1)
        reshaped_text = arabic_reshaper.reshape(actions[num])
        bidi_text = get_display(reshaped_text)
        draw.text((10, 60 + num * 40), f"{bidi_text} - {prob:.2f}", font=font, fill=(255, 255, 255))

    return np.array(img_pil)

def test_realtime():
    model = load_model('final_action_model.keras')
    print("✅ Model loaded successfully.")
    sequence = []
    current_action = ""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
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
            sequence = sequence[-30:]  # اخر 30 فريم فقط

            if len(sequence) == 30:
                seq_array = np.array(sequence)
                pad_width = model.input_shape[1] - seq_array.shape[0]
                seq_array = np.pad(seq_array, ((0, pad_width), (0, 0)), mode='constant')

                res = model.predict(np.expand_dims(seq_array, axis=0))[0]
                predicted_action = actions[np.argmax(res)]
                confidence = res[np.argmax(res)]

                # 🔵 Logging live في الكونسول
                print(f"🔍 Prediction: {predicted_action} | Confidence: {confidence:.2f}")
                print(f"🧠 Full Probabilities: {dict(zip(actions, [round(float(p), 2) for p in res]))}")

                if confidence > threshold:
                    current_action = predicted_action
                image = prob_viz(res, actions, image, colors)

            image = cv2.rectangle(image, (0, 0), (640, 40), (245, 117, 16), -1)
            image = put_arabic_text(image, current_action, (10, 5), font_size=32, color=(255, 255, 255))

            cv2.imshow('Real-Time Action Recognition', image)
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_realtime()
# import os
# import cv2
# import numpy as np
# import mediapipe as mp
# import arabic_reshaper
# from bidi.algorithm import get_display
# from PIL import ImageFont, ImageDraw, Image
#
# try:
#     import tensorflow as tf
#     from tensorflow.keras.models import load_model
# except ImportError as e:
#     print(f"Error importing TensorFlow modules: {e}")
#     exit(1)
#
# from utils import mediapipe_detection, draw_styled_landmarks, extract_keypoints
#
# # 🟢 إعدادات عامة
# DATA_PATH = os.path.join('Processed_Data')
# actions = np.array(sorted([d for d in os.listdir(DATA_PATH) if os.path.isdir(os.path.join(DATA_PATH, d))]))
# colors = [(245, 117, 16), (117, 245, 16), (16, 117, 245), (255, 0, 0), (0, 255, 255)]
# threshold = 0.4  # خفضته لتسهيل التقاط التوقعات
#
# # 🟢 إعداد خط الكتابة بالعربي
# def put_arabic_text(img, text, position, font_size=32, color=(255, 255, 255)):
#     reshaped_text = arabic_reshaper.reshape(text)
#     bidi_text = get_display(reshaped_text)
#     img_pil = Image.fromarray(img)
#     draw = ImageDraw.Draw(img_pil)
#     font = ImageFont.truetype("arial.ttf", font_size)
#     draw.text(position, bidi_text, font=font, fill=color)
#     return np.array(img_pil)
#
# # 🟢 فيجوالايزر للبروب
# def prob_viz(res, actions, input_frame, colors):
#     output_frame = input_frame.copy()
#     img_pil = Image.fromarray(output_frame)
#     draw = ImageDraw.Draw(img_pil)
#     font = ImageFont.truetype("arial.ttf", 24)
#
#     for num, prob in enumerate(res):
#         cv2.rectangle(output_frame, (0, 60 + num * 40), (int(prob * 640), 90 + num * 40), colors[num % len(colors)], -1)
#         reshaped_text = arabic_reshaper.reshape(actions[num])
#         bidi_text = get_display(reshaped_text)
#         draw.text((10, 60 + num * 40), f"{bidi_text} - {prob:.2f}", font=font, fill=(255, 255, 255))
#
#     return np.array(img_pil)
#
# # 🟢 تنفيذ التيست علي فولدر
# # 🟢 تنفيذ التيست علي فولدر
# def test_on_folder(folder_path, ground_truth_label):
#     model = load_model('final_action_model.keras')
#     print("✅ Model loaded successfully.")
#     total_sequences = 0
#     correct_predictions = 0
#     sequence = []
#     current_action = ""
#
#     with mp.solutions.holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
#         images = sorted(os.listdir(folder_path))
#         print(f"🖼️ Found {len(images)} images in folder '{folder_path}'")
#         for img_name in images:
#             img_path = os.path.join(folder_path, img_name)
#             frame = cv2.imread(img_path)
#             if frame is None:
#                 print(f"⚠️ Skipping {img_path}, couldn't load.")
#                 continue
#
#             image, results = mediapipe_detection(frame, holistic)
#             draw_styled_landmarks(image, results)
#             keypoints = extract_keypoints(results)
#             sequence.append(keypoints)
#
#         # ✅ هنا نعمل padding لو أقل من 30
#         if len(sequence) < 30:
#             padding_length = 30 - len(sequence)
#             sequence += [np.zeros_like(sequence[0])] * padding_length
#             print(f"⚠️ Sequence padded with {padding_length} empty frames to reach 30 frames.")
#
#         sequence = sequence[-30:]  # نخلي اخر 30 فريم بس (حتى لو عملنا padding)
#
#         seq_array = np.array(sequence)
#         pad_width = model.input_shape[1] - seq_array.shape[0]  # تأكد لو الموديل عايز أكتر من 30 (احتياط)
#         seq_array = np.pad(seq_array, ((0, pad_width), (0, 0)), mode='constant')
#
#         res = model.predict(np.expand_dims(seq_array, axis=0))[0]
#         predicted_action = actions[np.argmax(res)]
#         confidence = res[np.argmax(res)]
#
#         print(
#             f"[DEBUG] Sequence length: {len(sequence)} | Confidence: {confidence:.2f} | Predicted: {predicted_action} | GT: {ground_truth_label}")
#         print(f"[DEBUG] Full Probs: {dict(zip(actions, [round(float(p), 2) for p in res]))}")
#
#         total_sequences += 1
#         if confidence > threshold:
#             if predicted_action == ground_truth_label:
#                 correct_predictions += 1
#         else:
#             print(f"⚠️ Low confidence ({confidence:.2f}), prediction might not be reliable.")
#         # Visualization
#         image = prob_viz(res, actions, image, colors)
#         image = cv2.rectangle(image, (0, 0), (640, 40), (245, 117, 16), -1)
#         image = put_arabic_text(image, predicted_action, (10, 5), font_size=32, color=(255, 255, 255))
#
#         cv2.imshow('Test', image)
#         cv2.waitKey(0)  # هيقفلك الصورة لما تدوس أي زرار
#
#     acc = (correct_predictions / total_sequences) * 100 if total_sequences > 0 else 0
#     print(f"✅ Final Accuracy: {acc:.2f}% | Correct: {correct_predictions} / {total_sequences}")
#     cv2.destroyAllWindows()
#
#
# if __name__ == "__main__":
#     test_folder = r"C:\Users\Yasso\Downloads\test_sing_mode-main\01\test\0042\02_01_0042_(17_11_16_17_34_03)_c"
#     ground_truth_label = 'ز'  # عدلها حسب الكلاس اللي المفروض يكون صح
#     test_on_folder(test_folder, ground_truth_label)
#
