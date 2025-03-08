import os
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.python.keras.callbacks import TensorBoard
from tensorflow.python.keras.layers import LSTM, Dense
from tensorflow.python.keras.models import Sequential
from tensorflow.python.keras.utils.np_utils import to_categorical
import warnings

warnings.filterwarnings("ignore")

# Path for data
data_path = os.path.join("data")
actions = np.array(["hello", "thanks", "i love you"])
no_sequence = 30
sequence_length = 30

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
            y.append(actions.tolist().index(action))
    return np.array(X), np.array(y)

# Load data
print("Loading data...")
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
print("Starting model training...")
model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test), callbacks=[tb_callback])

# Save the trained model
model.save("action_recognition_model.h5")
print("Model training completed and saved as 'action_recognition_model.h5'")

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test accuracy: {accuracy:.4f}")