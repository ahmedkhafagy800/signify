# import os
# import numpy as np
# import tensorflow as tf
# import keras
# from keras.utils import to_categorical
# from keras.models import Sequential
# from keras.layers import LSTM, Dense, Dropout, Input, Bidirectional, BatchNormalization
# from keras.callbacks import TensorBoard, EarlyStopping, ModelCheckpoint
#
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import classification_report, confusion_matrix
# import seaborn as sns
# import matplotlib.pyplot as plt
#
# # Mixed Precision (هيخلي ال GPU أسرع لو مدعوم)
# from keras import mixed_precision
#
# mixed_precision.set_global_policy('mixed_float16')
#
# # Data Constants
# DATA_PATH = './Processed_Data'
# sequence_length = 100
#
#
# def load_data():
#     classes = sorted(os.listdir(DATA_PATH))
#     label_map = {label: num for num, label in enumerate(classes)}
#     print(f"🗂️ Classes detected: {classes}")
#
#     sequences, labels = [], []
#     for action in classes:
#         action_path = os.path.join(DATA_PATH, action)
#         for file_name in os.listdir(action_path):
#             file_path = os.path.join(action_path, file_name)
#             if file_path.endswith('.npy'):
#                 seq = np.load(file_path)
#                 if seq.shape[0] != sequence_length:
#                     continue
#                 sequences.append(seq)
#                 labels.append(label_map[action])
#
#     X = np.array(sequences)
#     y = to_categorical(labels, num_classes=len(classes)).astype('float32')
#     print(f"✅ Loaded {len(X)} sequences.")
#
#     unique, counts = np.unique(np.argmax(y, axis=1), return_counts=True)
#     print(f"📊 Data distribution: {dict(zip(classes, counts))}")
#     return X, y, classes
#
#
# def build_dataset(X, y, batch_size=64, shuffle=True):
#     dataset = tf.data.Dataset.from_tensor_slices((X, y))
#     if shuffle:
#         dataset = dataset.shuffle(buffer_size=len(X))
#     dataset = dataset.batch(batch_size)
#     dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)
#     return dataset
#
#
# def build_model(num_classes):
#     model = Sequential([
#         Input(shape=(sequence_length, X.shape[2])),
#         Bidirectional(LSTM(128, return_sequences=True, activation='relu')),
#         LayerNormalization(),
#         Dropout(0.3),
#         Bidirectional(LSTM(256, return_sequences=True, activation='relu')),
#         LayerNormalization(),
#         Dropout(0.3),
#         Bidirectional(LSTM(128, return_sequences=False, activation='relu')),
#         Dense(128, activation='relu'),
#         Dropout(0.2),
#         Dense(num_classes, activation='softmax', dtype='float32')
#     ])
#
#     model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
#                   loss='categorical_crossentropy',
#                   metrics=['categorical_accuracy'])
#     return model
#
#
# def plot_confusion_matrix(y_true, y_pred, classes):
#     cm = confusion_matrix(y_true, y_pred)
#     plt.figure(figsize=(6, 5))
#     sns.heatmap(cm, annot=True, fmt='d', xticklabels=classes, yticklabels=classes, cmap="Blues")
#     plt.xlabel('Predicted')
#     plt.ylabel('True')
#     plt.title('Confusion Matrix')
#     plt.show()
#
#
# if __name__ == "__main__":
#     print(f"TensorFlow version: {tf.__version__}")
#
#     X, y, classes = load_data()
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
#
#     train_ds = build_dataset(X_train, y_train)
#     test_ds = build_dataset(X_test, y_test, shuffle=False)
#
#     model = build_model(num_classes=len(classes))
#
#     callbacks = [
#         TensorBoard(log_dir='Logs'),
#         EarlyStopping(monitor='val_categorical_accuracy', patience=15, restore_best_weights=True),
#         ModelCheckpoint('best_model.h5', monitor='val_categorical_accuracy', save_best_only=True)
#     ]
#
#     model.fit(train_ds, validation_data=test_ds, epochs=250, callbacks=callbacks)
#
#     # Evaluate
#     print("\n🔍 Evaluating model...")
#     y_pred = model.predict(test_ds)
#     y_pred_classes = np.argmax(y_pred, axis=1)
#     y_true_classes = np.argmax(y_test, axis=1)
#     print(classification_report(y_true_classes, y_pred_classes, target_names=classes))
#     plot_confusion_matrix(y_true_classes, y_pred_classes, classes)
#
#     model.save('final_model.h5')
#     print("✅ Model saved as 'final_model.h5'.")
import os
import numpy as np
import concurrent.futures
from keras.src.callbacks import EarlyStopping, ModelCheckpoint
from keras.src.layers import Bidirectional, Masking
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import tensorflow as tf

try:
    from tensorflow.keras.utils import to_categorical
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import TensorBoard
    from tensorflow.keras.layers import Input
except ImportError as e:
    print(f"Error importing TensorFlow modules: {e}")
    exit(1)

tf.config.threading.set_intra_op_parallelism_threads(0)
tf.config.threading.set_inter_op_parallelism_threads(0)
print("✅ CPU Multi-processing enabled")

DATA_PATH = os.path.join('Processed_Data')
actions = np.array(sorted([d for d in os.listdir(DATA_PATH) if os.path.isdir(os.path.join(DATA_PATH, d))]))
print(f"📂 Classes detected: {actions}")

def augment_sequence(sequence):
    noise = np.random.normal(0, 0.01, sequence.shape)
    sequence += noise
    scale = np.random.uniform(0.9, 1.1)
    sequence *= scale
    shift = np.random.uniform(-0.05, 0.05, (1, sequence.shape[1]))
    sequence += shift
    return sequence

# 📌 Multi-processing file loader
def process_file(args):
    file_path, label, augment = args
    try:
        data = np.load(file_path)
        sequences = [data]
        labels = [label]
        if augment:
            aug_data = augment_sequence(np.copy(data))
            sequences.append(aug_data)
            labels.append(label)
        return sequences, labels, data.shape[0]
    except Exception as e:
        print(f"⚠️ Skipping {file_path}: {e}")
        return [], [], 0

def load_data_parallel(augment=False):
    label_map = {label: num for num, label in enumerate(actions)}
    tasks = []

    for action in actions:
        action_path = os.path.join(DATA_PATH, action)
        for file_name in os.listdir(action_path):
            file_path = os.path.join(action_path, file_name)
            if file_name.endswith('.npy'):
                tasks.append((file_path, label_map[action], augment))

    sequences, labels = [], []
    max_seq_len = 0

    # هنا استخدمنا process pool علشان كل core يشتغل منفصل
    with concurrent.futures.ProcessPoolExecutor() as executor:
        results = executor.map(process_file, tasks)
        for seqs, lbls, seq_len in results:
            sequences.extend(seqs)
            labels.extend(lbls)
            if seq_len > max_seq_len:
                max_seq_len = seq_len

    if not sequences:
        raise ValueError("No valid sequences loaded. Check processed data folder.")

    padded_sequences = []
    for seq in sequences:
        pad_width = max_seq_len - seq.shape[0]
        padded_seq = np.pad(seq, ((0, pad_width), (0, 0)), mode='constant')
        padded_sequences.append(padded_seq)

    X = np.array(padded_sequences)
    y = to_categorical(labels, num_classes=len(actions)).astype(int)
    print(f"✅ Loaded {len(X)} valid sequences with max length {max_seq_len}.")
    return X, y, max_seq_len

def build_model(max_seq_len):
    model = Sequential()
    model.add(Input(shape=(max_seq_len, 258)))
    model.add(Masking(mask_value=0.0))
    model.add(Bidirectional(LSTM(256, return_sequences=True)))
    model.add(Dropout(0.5))
    model.add(Bidirectional(LSTM(128, return_sequences=True)))
    model.add(Dropout(0.5))
    model.add(Bidirectional(LSTM(64, return_sequences=False)))
    model.add(Dropout(0.3))
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.3))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(len(actions), activation='softmax'))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0003),
                  loss='categorical_crossentropy',
                  metrics=['categorical_accuracy'])
    return model

if __name__ == "__main__":
    print(f"TensorFlow version: {tf.__version__}")
    print(tf.config.list_physical_devices('CPU'))

    try:
        X, y, max_seq_len = load_data_parallel(augment=True)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        exit(1)

    model = build_model(max_seq_len)
    callbacks = [
        TensorBoard(log_dir=os.path.join('Logs')),
        EarlyStopping(monitor='val_categorical_accuracy', patience=10, restore_best_weights=True),
        ModelCheckpoint('best_action_model.keras', save_best_only=True, monitor='val_categorical_accuracy')
    ]

    train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train)) \
        .shuffle(buffer_size=2048) \
        .batch(64) \
        .prefetch(tf.data.AUTOTUNE)

    val_dataset = tf.data.Dataset.from_tensor_slices((X_test, y_test)) \
        .batch(64) \
        .prefetch(tf.data.AUTOTUNE)

    model.fit(train_dataset, validation_data=val_dataset, epochs=250, callbacks=callbacks)
    model.save('final_action_model.keras')
    print("✅ Training completed. Model saved as 'final_action_model.keras'.")

    print("\n🔍 Evaluating model...")
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true_classes = np.argmax(y_test, axis=1)

    print("\nClassification Report:")
    print(classification_report(
        y_true_classes,
        y_pred_classes,
        labels=np.unique(y_true_classes),
        target_names=actions[np.unique(y_true_classes)]
    ))

    cm = confusion_matrix(y_true_classes, y_pred_classes)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=actions, yticklabels=actions, cmap="Blues")
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.show()
