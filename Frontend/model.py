import os
import warnings

import cv2
import mediapipe as mp
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.python.keras.callbacks import TensorBoard
from tensorflow.python.keras.layers import LSTM, Dense
from tensorflow.python.keras.models import Sequential
from tensorflow.python.keras.utils.np_utils import to_categorical
warnings.filterwarnings("ignore")


# Initialize MediaPipe Holistic and drawing utilities
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Function to process image with MediaPipe
def mediapipe_detection(img, model):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB for MediaPipe
    img.flags.writeable = False  # Make image read-only
    result = model.process(img)  # Process the image with the model
    img.flags.writeable = True  # Make image writable again
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)  # Convert back to BGR for OpenCV
    return img, result

# Function to draw styled landmarks on the image
def draw_styled_landmarks(img, result):
    # Draw face landmarks
    if result.face_landmarks:
        mp_drawing.draw_landmarks(img, result.face_landmarks, mp_holistic.FACEMESH_TESSELATION,
                                  mp_drawing.DrawingSpec(color=(80, 110, 10), thickness=1, circle_radius=1),
                                  mp_drawing.DrawingSpec(color=(80, 256, 180), thickness=1, circle_radius=1))

    # Draw pose landmarks
    if result.pose_landmarks:
        mp_drawing.draw_landmarks(img, result.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                                  mp_drawing.DrawingSpec(color=(80, 22, 10), thickness=1, circle_radius=4),
                                  mp_drawing.DrawingSpec(color=(80, 44, 180), thickness=1, circle_radius=2))

    # Draw left hand landmarks
    if result.left_hand_landmarks:
        mp_drawing.draw_landmarks(img, result.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                                  mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=1, circle_radius=4),
                                  mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=1, circle_radius=2))

    # Draw right hand landmarks
    if result.right_hand_landmarks:
        mp_drawing.draw_landmarks(img, result.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                                  mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=1, circle_radius=4),
                                  mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=1, circle_radius=2))

# Function to extract keypoints from MediaPipe results
def extract_keypoints(result):
    pose_landmarks = np.array([[res.x, res.y, res.visibility] for res in
                               result.pose_landmarks.landmark]).flatten() if result.pose_landmarks else np.zeros(33 * 3)
    left_hand_landmarks = np.array([[res.x, res.y, res.visibility] for res in
                                    result.left_hand_landmarks.landmark]).flatten() if result.left_hand_landmarks else np.zeros(21 * 3)
    right_hand_landmarks = np.array([[res.x, res.y, res.visibility] for res in
                                     result.right_hand_landmarks.landmark]).flatten() if result.right_hand_landmarks else np.zeros(21 * 3)
    face_landmarks = np.array([[res.x, res.y, res.visibility] for res in
                               result.face_landmarks.landmark]).flatten() if result.face_landmarks else np.zeros(468 * 3)
    return np.concatenate([pose_landmarks, left_hand_landmarks, right_hand_landmarks, face_landmarks])

# Path for data
data_path = os.path.join("data")
actions = np.array(["hello", "thanks", "i love you"])
no_sequence = 30
sequence_length = 30

# Create directories for data storage
for action in actions:
    for sequence in range(no_sequence):
        try:
            os.makedirs(os.path.join(data_path, action, str(sequence)))
        except:
            pass

# Initialize webcam capture
cap = cv2.VideoCapture(0)

# Data Collection Loop
with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    for action in actions:
        for sequence in range(no_sequence):
            for frame_num in range(sequence_length):
                res, frame = cap.read()
                if not res:
                    print("Capture failed")
                    break

                # Flip the frame horizontally for a mirror effect
                frame = cv2.flip(frame, 1)

                # Process the frame with MediaPipe Holistic
                img, result = mediapipe_detection(frame, holistic)

                # Draw landmarks on the image
                draw_styled_landmarks(img, result)

                # Display text for data collection status
                if frame_num == 0:
                    cv2.putText(img, "STARTING COLLECTION", (120, 200),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)
                    cv2.putText(img, f"COLLECTING FRAMES for {action} video number {sequence}", (15, 12),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                    cv2.imshow("OpenCV Feed", img)
                    cv2.waitKey(800)  # Pause before starting collection
                else:
                    cv2.putText(img, f"COLLECTING FRAMES for {action} video number {sequence}", (15, 12),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                    cv2.imshow("OpenCV Feed", img)

                # Extract and save keypoints
                key_points = extract_keypoints(result)
                npy_path = os.path.join(data_path, action, str(sequence), str(frame_num))
                np.save(npy_path, key_points)

                # Exit on 'q' key press
                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break

    # Release webcam and close windows
    cap.release()
    cv2.destroyAllWindows()

# --- Model Training Section ---
print("Starting model training...")

# Function to load saved data
def load_data():
    X, y = [], []
    for action in actions:
        for sequence in range(no_sequence):
            window = []
            for frame_num in range(sequence_length):
                res = np.load(os.path.join(data_path, action, str(sequence), f"{frame_num}.npy"))
                window.append(res)
            X.append(window)
            y.append(actions.tolist().index(action))  # Label as index of action
    return np.array(X), np.array(y)

# Load data
X, y = load_data()

# Prepare data for training
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
y_train = to_categorical(y_train, num_classes=len(actions))
y_test = to_categorical(y_test, num_classes=len(actions))

# Define the LSTM model
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, X.shape[2])))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(len(actions), activation='softmax'))

# Compile the model
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Set up TensorBoard for monitoring (optional)
log_dir = os.path.join("logs")
tb_callback = TensorBoard(log_dir=log_dir)

# Train the model
model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test), callbacks=[tb_callback])

# Save the trained model
model.save("action_recognition_model.h5")
print("Model training completed and saved as 'action_recognition_model.h5'")

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test accuracy: {accuracy:.4f}")