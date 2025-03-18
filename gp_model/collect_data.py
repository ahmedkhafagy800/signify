import os
import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
from pillow_heif import register_heif_opener
from utils import mediapipe_detection, draw_styled_landmarks, extract_keypoints
import arabic_reshaper
from bidi.algorithm import get_display


def put_arabic_text(image, text, position, font_size=24):
    """لإظهار نص عربي داخل صورة OpenCV"""
    # تجهيز النص العربي للعرض بشكل صحيح
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)

    # تحويل الصورة من OpenCV إلى PIL
    image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    # تحميل الخط - تأكد إن عندك خط عربي في المشروع
    from PIL import ImageFont, ImageDraw
    font = ImageFont.truetype("arial.ttf", font_size)  # تقدر تغيّر الخط هنا

    draw = ImageDraw.Draw(image_pil)
    draw.text(position, bidi_text, font=font, fill=(255, 255, 255))

    # تحويل الصورة مرة تانية لـ OpenCV
    return cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)


# تسجيل HEIC مع Pillow
register_heif_opener()

# Constants
DATA_PATH = os.path.join('MP_Data')
INPUT_PATH = os.path.join('signify')
actions = np.array(['اهلا', 'بحبك', 'شكرا'])
sequence_length = 30


def load_image(image_path):
    """يحمل الصورة سواء كانت HEIC أو JPG عادي"""
    try:
        image = Image.open(image_path)
        image = image.convert("RGB")
        image = np.array(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image
    except Exception as e:
        print(f"[خطأ] فشل تحميل الصورة {image_path}: {e}")
        return None
def get_start_index(action):
    """ترجع رقم البداية للتسلسل الجديد بناءً على الداتا اللي متخزنة"""
    action_dir = os.path.join(DATA_PATH, action)
    if not os.path.exists(action_dir):
        return 0
    existing_sequences = [int(seq) for seq in os.listdir(action_dir) if seq.isdigit()]
    return max(existing_sequences, default=-1) + 1
def setup_directories(start_indices, total_sequences_per_action):
    for action in actions:
        if action not in total_sequences_per_action:
            continue

        action_dir = os.path.join(DATA_PATH, action)
        os.makedirs(action_dir, exist_ok=True)

        total_sequences = total_sequences_per_action[action]
        start_idx = start_indices[action]

        for seq in range(start_idx, start_idx + total_sequences):
            seq_dir = os.path.join(action_dir, str(seq))
            os.makedirs(seq_dir, exist_ok=True)

def collect_data_from_folder():
    total_sequences_per_action = {}
    start_indices = {}

    for action in actions:
        action_path = os.path.join(INPUT_PATH, action)
        image_files = sorted([f for f in os.listdir(action_path) if f.endswith(('.png', '.jpg', '.jpeg', '.heic', '.HEIC'))])

        if len(image_files) < sequence_length:
            print(f"[خطأ] الأكشن '{action}' فيه أقل من {sequence_length} صورة. موجود: {len(image_files)}")
            continue

        if len(image_files) % sequence_length != 0:
            print(f"[تحذير] الأكشن '{action}' فيه {len(image_files)} صورة ومش قابل للقسمة على {sequence_length}")

        total_sequences_per_action[action] = len(image_files) // sequence_length
        start_indices[action] = get_start_index(action)

    setup_directories(start_indices, total_sequences_per_action)

    with mp.solutions.holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        for action in actions:
            if action not in total_sequences_per_action:
                continue

            action_path = os.path.join(INPUT_PATH, action)
            image_files = sorted([f for f in os.listdir(action_path) if f.endswith(('.png', '.jpg', '.jpeg', '.heic', '.HEIC'))])
            total_sequences = total_sequences_per_action[action]
            start_idx = start_indices[action]

            for sequence in range(total_sequences):
                seq_number = start_idx + sequence
                sequence_dir = os.path.join(DATA_PATH, action, str(seq_number))

                for frame_num in range(sequence_length):
                    idx = sequence * sequence_length + frame_num
                    image_path = os.path.join(action_path, image_files[idx])

                    image = load_image(image_path)
                    if image is None:
                        print(f"خطأ في قراءة الصورة: {image_path}")
                        continue

                    image = cv2.resize(image, (640, 480))
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    results = holistic.process(image_rgb)

                    draw_styled_landmarks(image, results)

                    # الكتابة بالعربي
                    image = put_arabic_text(
                        image,
                        f'{action} - التسلسل {seq_number} - فريم {frame_num}',
                        (10, 20)
                    )

                    cv2.imshow('تجميع البيانات', image)

                    npy_path = os.path.join(sequence_dir, f'{frame_num}.npy')
                    keypoints = extract_keypoints(results)
                    np.save(npy_path, keypoints)

                    if cv2.waitKey(10) & 0xFF == ord('q'):
                        break
                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cv2.destroyAllWindows()
    print("✅ تم الانتهاء من تجميع البيانات من الصور.")


# باقي الدوال زي ما هي...


if __name__ == "__main__":
    collect_data_from_folder()
