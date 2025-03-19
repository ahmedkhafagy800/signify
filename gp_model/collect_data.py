# import os
# import cv2
# import numpy as np
# import mediapipe as mp
# from PIL import Image, ImageFont, ImageDraw
# import arabic_reshaper
# from bidi.algorithm import get_display
# from utils import mediapipe_detection, draw_styled_landmarks, extract_keypoints
#
# # Constants
# DATA_PATH = os.path.join('MP_Data')
# actions = np.array(['اهلا', 'شكرا', 'بحبك'])
# no_sequences = 30
# sequence_length = 30
#
#
# def setup_directories():
#     """إنشاء مجلدات لتخزين البيانات"""
#     for action in actions:
#         for sequence in range(no_sequences):
#             os.makedirs(os.path.join(DATA_PATH, action, str(sequence)), exist_ok=True)
#
#
# def put_arabic_text(image, text, position, font_size=32):
#     """إضافة نص عربي على صورة OpenCV"""
#     reshaped_text = arabic_reshaper.reshape(text)
#     bidi_text = get_display(reshaped_text)
#
#     image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
#     font = ImageFont.truetype("arial.ttf", font_size)
#     draw = ImageDraw.Draw(image_pil)
#     draw.text(position, bidi_text, font=font, fill=(255, 255, 255))
#     return cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
#
#
# def collect_data():
#     """جمع البيانات من الكاميرا وتخزينها كـ numpy arrays"""
#     setup_directories()
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("❌ خطأ: لم يتم فتح الكاميرا.")
#         return
#
#     with mp.solutions.holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
#         for action in actions:
#             for sequence in range(no_sequences):
#                 # العد التنازلي قبل بداية كل action
#                 for countdown in range(3, 0, -1):
#                     ret, frame = cap.read()
#                     frame = cv2.flip(frame, 1)
#                     frame = put_arabic_text(frame, f'جاهز؟ يبدأ بعد {countdown}...', (150, 200), 36)
#                     cv2.imshow('تجميع البيانات', frame)
#                     cv2.waitKey(1000)
#
#                 for frame_num in range(sequence_length):
#                     ret, frame = cap.read()
#                     if not ret:
#                         print("❌ خطأ: تعذر التقاط الفريم.")
#                         break
#
#                     frame = cv2.flip(frame, 1)
#                     image, results = mediapipe_detection(frame, holistic)
#                     draw_styled_landmarks(image, results)
#
#                     # كتابة اسم الحركة والتسلسل والفريم بالعربي
#                     text = f'جمع {action} | فيديو {sequence + 1} | فريم {frame_num + 1}'
#                     image = put_arabic_text(image, text, (10, 20))
#
#                     cv2.imshow('تجميع البيانات', image)
#
#                     # تخزين الـ keypoints
#                     keypoints = extract_keypoints(results)
#                     npy_path = os.path.join(DATA_PATH, action, str(sequence), str(frame_num))
#                     np.save(npy_path, keypoints)
#
#                     if cv2.waitKey(10) & 0xFF == ord('q'):
#                         cap.release()
#                         cv2.destroyAllWindows()
#                         print("❌ تم إلغاء التجميع.")
#                         return
#
#     cap.release()
#     cv2.destroyAllWindows()
#     print("✅ تم الانتهاء من تجميع البيانات بنجاح.")
#
#
# if __name__ == "__main__":
#     collect_data()
# import os
# import cv2
# import numpy as np
# import pandas as pd
# import mediapipe as mp
# from concurrent.futures import ThreadPoolExecutor, as_completed
# from tqdm import tqdm
#
# # ------------------------------
# # إعداد Mediapipe
# mp_holistic = mp.solutions.holistic
#
# # ------------------------------
# # تحميل ملف الـ Excel وعمل mapping بين ID والكلمة
# labels_df = pd.read_excel('KARSL-502_Labels.xlsx')
# id_to_word = {str(row['SignID']).zfill(4): row['Sign-Arabic'] for _, row in labels_df.iterrows()}
#
# # ------------------------------
# # إعداد المسارات
# DATASET_PATH = '/01/train'
# SAVE_PATH = './Processed_Data'
# os.makedirs(SAVE_PATH, exist_ok=True)
#
# # ------------------------------
# # إعداد الفريمات اللي هنشتغل عليها (من فولدر 0035 لحد 0100)
# folders_range = range(35, 101)  # يعني 0035 إلى 0100
#
# # ------------------------------
# # استخراج keypoints من mediapipe
# def extract_keypoints(results):
#     pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33 * 4)
#     lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
#     rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
#     return np.concatenate([pose, lh, rh])
#
# # ------------------------------
# # معالجة كل فولدر فرعي للفيديوهات (sequence)
# def process_folder(folder_path, save_word_dir, subfolder_name):
#     # قراءة الفريمات بشكل مرتب
#     frames = sorted(os.listdir(folder_path))
#     keypoints_sequence = []
#
#     with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
#         for frame in frames:
#             frame_path = os.path.join(folder_path, frame)
#             img = cv2.imread(frame_path)
#             img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#             results = holistic.process(img_rgb)
#             keypoints = extract_keypoints(results)
#             keypoints_sequence.append(keypoints)
#
#     # حفظ النتيجة
#     keypoints_sequence = np.array(keypoints_sequence)
#     os.makedirs(save_word_dir, exist_ok=True)
#     np.save(os.path.join(save_word_dir, f'{subfolder_name}.npy'), keypoints_sequence)
#
# # ------------------------------
# # Main function
# def main():
#     tasks = []
#     with ThreadPoolExecutor(max_workers=8) as executor:
#         for i in folders_range:
#             folder_id = str(i).zfill(4)
#             folder_full_path = os.path.join(DATASET_PATH, folder_id)
#             if not os.path.exists(folder_full_path):
#                 continue
#
#             word = id_to_word.get(folder_id, None)
#             if word is None:
#                 continue
#
#             subfolders = os.listdir(folder_full_path)
#             for sub in subfolders:
#                 sub_path = os.path.join(folder_full_path, sub)
#                 save_word_dir = os.path.join(SAVE_PATH, word)
#                 tasks.append(executor.submit(process_folder, sub_path, save_word_dir, sub))
#
#         for _ in tqdm(as_completed(tasks), total=len(tasks)):
#             pass
#
#     print("✅ تم الانتهاء من استخراج الـ keypoints وحفظهم بالكلمات.")
#
# # ------------------------------
# if __name__ == "__main__":
#     main()
import os
import cv2
import numpy as np
import pandas as pd
import mediapipe as mp
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# ------------------------------
# إعداد Mediapipe
mp_holistic = mp.solutions.holistic

# ------------------------------
# تحميل ملف الـ Excel وعمل mapping بين ID والكلمة
labels_df = pd.read_excel('KARSL-502_Labels.xlsx')
id_to_word = {str(row['SignID']).zfill(4): row['Sign-Arabic'] for _, row in labels_df.iterrows()}

# ------------------------------
# إعداد المسارات
DATASET_PATH = '01/train'  # تأكد إنه صح بالنسبة لمكان الكود
SAVE_PATH = './Processed_Data'
os.makedirs(SAVE_PATH, exist_ok=True)

# ------------------------------
# الفولدرات اللي هتشتغل عليها
folders_range = range(35, 101)  # يعني 0035 إلى 0100

# ------------------------------
# استخراج keypoints
def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33 * 4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
    return np.concatenate([pose, lh, rh])

# ------------------------------
# معالجة كل فولدر فيديو (sequence)
def process_folder(folder_path, save_word_dir, subfolder_name):
    try:
        print(f"🔍 شغال على: {folder_path}")
        frames = sorted(os.listdir(folder_path))
        keypoints_sequence = []

        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            for frame in frames:
                frame_path = os.path.join(folder_path, frame)
                img = cv2.imread(frame_path)

                if img is None:
                    print(f"⚠️ الصورة مش مقروءة: {frame_path}")
                    continue

                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = holistic.process(img_rgb)
                keypoints = extract_keypoints(results)
                keypoints_sequence.append(keypoints)

        if keypoints_sequence:
            keypoints_sequence = np.array(keypoints_sequence)
            os.makedirs(save_word_dir, exist_ok=True)
            save_path = os.path.join(save_word_dir, f'{subfolder_name}.npy')
            np.save(save_path, keypoints_sequence)
            print(f"✅ تم الحفظ في: {save_path}")
        else:
            print(f"⚠️ لا يوجد keypoints محفوظة لـ: {folder_path}")
    except Exception as e:
        print(f"❌ خطأ أثناء المعالجة {folder_path}: {e}")

# ------------------------------
# Main function
def main():
    tasks = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        for i in folders_range:
            folder_id = str(i).zfill(4)
            folder_full_path = os.path.join(DATASET_PATH, folder_id)
            if not os.path.exists(folder_full_path):
                print(f"⚠️ فولدر غير موجود: {folder_full_path}")
                continue

            word = id_to_word.get(folder_id, None)
            if word is None:
                print(f"⚠️ لا يوجد كلمة مقابلة لـ ID: {folder_id}")
                continue

            subfolders = os.listdir(folder_full_path)
            if not subfolders:
                print(f"⚠️ مفيش subfolders في: {folder_full_path}")
            for sub in subfolders:
                sub_path = os.path.join(folder_full_path, sub)
                save_word_dir = os.path.join(SAVE_PATH, word)
                tasks.append(executor.submit(process_folder, sub_path, save_word_dir, sub))

        for _ in tqdm(as_completed(tasks), total=len(tasks)):
            pass

    print("✅ تم الانتهاء من استخراج الـ keypoints وحفظهم بالكلمات.")

# ------------------------------
if __name__ == "__main__":
    main()
