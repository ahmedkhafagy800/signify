import os
import numpy as np
from sklearn.model_selection import train_test_split

try:
    import tensorflow as tf
    from tensorflow.keras.utils import to_categorical
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import TensorBoard
    from tensorflow.keras.layers import Input
except ImportError as e:
    print(f"Error importing TensorFlow modules: {e}")
    print("Please ensure TensorFlow is installed correctly (e.g., `pip install tensorflow`)")
    exit(1)

from utils import extract_keypoints

# Constants
actions = np.array(['اهلا', 'بحبك', 'شكرا'])
sequence_length = 30
DATA_PATH = os.path.join('MP_Data')


def load_data():
    """Load collected keypoints and prepare for training."""
    label_map = {label: num for num, label in enumerate(actions)}
    sequences, labels = [], []
    for action in actions:
        action_path = os.path.join(DATA_PATH, action)
        for sequence in os.listdir(action_path):  # Load all available sequences dynamically
            window = []
            for frame_num in range(sequence_length):
                file_path = os.path.join(action_path, str(sequence), f"{frame_num}.npy")
                if not os.path.exists(file_path):
                    print(f"Missing file: {file_path}")
                    continue
                res = np.load(file_path)
                window.append(res)
            if len(window) == sequence_length:  # Ensure full sequence
                sequences.append(window)
                labels.append(label_map[action])
    if not sequences:
        raise ValueError("No valid sequences loaded. Check data collection.")
    X = np.array(sequences)
    y = to_categorical(labels, num_classes=len(actions)).astype(int)
    return X, y


def train_model(X_train, y_train):
    """Build and train the LSTM model."""
    model = Sequential()
    model.add(Input(shape=(sequence_length, 1662)))
    model.add(LSTM(64, return_sequences=True, activation='relu'))
    model.add(Dropout(0.3))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(Dropout(0.3))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(len(actions), activation='softmax'))

    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    model.fit(X_train, y_train, epochs=250, callbacks=[TensorBoard(log_dir=os.path.join('Logs'))])

    model.save('action.h5')
    print("Model saved successfully!")
    return model


if __name__ == "__main__":
    print(f"TensorFlow version: {tf.__version__}")
    try:
        X, y = load_data()
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05, random_state=42)
    except Exception as e:
        print(f"Error loading data: {e}")
        exit(1)

    try:
        model = train_model(X_train, y_train)
        print("Training completed. Model saved as 'action.h5'.")
    except Exception as e:
        print(f"Error during training: {e}")
        exit(1)
