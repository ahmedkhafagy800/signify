import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img;
import 'dart:isolate';
import 'package:http_parser/http_parser.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/services.dart';

class CameraScreen extends StatefulWidget {
  @override
  _CameraScreenState createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller; //Manages camera hardware and frame streaming, '?' for null safety
  String _translation = "جاري التحميل..."; //Stores the detected sign language text
  DateTime? _lastProcessed; //Timestamp for frame rate throttling
  DateTime? _lastSnackbarTime; // Track last snackbar display time
  String? _sessionId;  // Add session ID storage
  final Uuid _uuid = Uuid();  // For generating UUIDs
  bool _isProcessing = false; // To prevent overlapping requests
  String? _lastWord; //used to check duplicates
  String? _selectedLanguage; // For dropdown value
  String _translatedText = ""; // Stores final translation
  bool _isTranslating = false; // Loading state

  @override
  void initState() {
    super.initState();
    _initCamera();//start setting up the camera
    _generateSessionId();  // Initialize session ID
  }
  void _generateSessionId() {
    _sessionId = _uuid.v4();
    print('🆔 Generated Session ID: $_sessionId');
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();//uses the camera plugin to get a list of available cameras on the device => save it in cameras
    _controller = CameraController(
      cameras[1],//initializes the controller 1.with the first camera (usually the rear camera) and 2.sets the resolution to low*updated*
      ResolutionPreset.low,
    );
    await _controller!.initialize();// initializes the camera hardware
    _controller!.startImageStream((image) => _processFrame(image));//image format depends on camera // everytime a frame is available
    setState(() {});//display camera preview once the controller is initialized
  }

  Future<void> _processFrame(CameraImage image) async {
    if (_isProcessing) return;  // Prevent overlapping processing
    _isProcessing = true;

    // Throttle to 10 FPS (100ms between frames)
    if (_lastProcessed != null &&
        DateTime.now().difference(_lastProcessed!) < Duration(milliseconds: 100)) {
      return;
    }
    _lastProcessed = DateTime.now();

    try {
      print('🐞 Processing frame at ${DateTime.now().toIso8601String()}'); //Track frame processing timing

      // Convert CameraImage to JPEG bytes
      final Uint8List? jpegBytes = await _convertImage(image); // MOST INTENSIVE STEP

      if (jpegBytes == null || jpegBytes.isEmpty) {
        print('🖼️ Empty JPEG bytes');
        return;
      }

      // Verify JPEG validity
      if (!_isValidJpeg(jpegBytes)) {
        print('🖼️ Invalid JPEG data');
        return;
      }

      print('📤 Sending frame (${jpegBytes.length} bytes)');
      // Create request with timeout
      final request = http.MultipartRequest(
          'POST',
          Uri.parse('http://192.168.7.181:8000/predict')
      )
        ..files.add(http.MultipartFile.fromBytes(
          'file',
          jpegBytes,
          filename: 'frame.jpg',
          contentType: MediaType('image', 'jpeg'),
        ))
        ..headers['X-Session-Id'] = _sessionId!;  // Add session header

      final response = await request.send().timeout(Duration(seconds: 3));

      print('📥 Received response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final json = await response.stream.bytesToString();
        final decodedJson = jsonDecode(json);

        // Reset loading/error messages
        if (_translation == "جاري التحميل..." ||
            _translation.startsWith("⚠️") ||
            _translation.startsWith("📡")) {
          _translation = "";
        }

        //handle response - new
        if (decodedJson.containsKey('sign')) {
          final newWord = decodedJson['sign'] as String;
          final isSameWord = newWord == _lastWord;
          // Handle special cases
          if (newWord == "لا يوجد إشارة واضحة") {
            final now = DateTime.now();
            // Only show snackbar if 2 seconds have passed since last one
            if (_lastSnackbarTime == null ||
                now.difference(_lastSnackbarTime!) > Duration(seconds: 20)) {

              if (mounted) { // Ensure widget is still in tree
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('الإشارة غير واضحة'),
                      duration: Duration(seconds: 5),
                    )
                );
                _lastSnackbarTime = now; // Update last shown time
              }
            }
          }
          else if (newWord.isNotEmpty && newWord != "...") {
            if (!isSameWord) {
              setState(() {
                _translation += '${_translation.isNotEmpty ? ' ' : ''}$newWord';
              });
              _lastWord = newWord;
            }
          }
        }
      } else {
        final error = await response.stream.bytesToString();
        print('🚨 Server error: $error');
        setState(() => _translation = "⚠️ Server Error ${response.statusCode}");
      }
    } catch (e) {
      print('🚨 Processing error: $e');
      setState(() => _translation = "📡 Connection Error");
    } finally {
      _isProcessing = false;  // Release processing lock
    }
  }

  bool _isValidJpeg(Uint8List bytes) {
    // Basic JPEG header check
    return bytes.length > 2 &&
        bytes[0] == 0xFF &&
        bytes[1] == 0xD8 &&
        bytes[bytes.length-2] == 0xFF &&
        bytes[bytes.length-1] == 0xD9;
  }

  // 1. Fix encodeJpg error by adding img prefix
  Future<Uint8List> _convertImage(CameraImage image) async {
    try {
      final convertedImage = switch (image.format.group) {
        ImageFormatGroup.yuv420 => _convertYUV420(image),
        ImageFormatGroup.bgra8888 => _convertBGRA8888(image),
        _ => throw Exception('Unsupported format: ${image.format}'),
      };
      return Uint8List.fromList(img.encodeJpg(convertedImage)); // 👈 Add img. prefix
    } catch (e) {
      print('Conversion error: $e');
      return Uint8List(0);
    }
  }

// 2. YUV420 Conversion Implementation
  img.Image _convertYUV420(CameraImage image) {
    final yPlane = image.planes[0];
    final uPlane = image.planes[1];
    final vPlane = image.planes[2];

    final img.Image frame = img.Image(
      width: image.width,
      height: image.height,
    );

    // Conversion parameters
    final int uvRowStride = uPlane.bytesPerRow;
    final int uvPixelStride = uPlane.bytesPerPixel!;
    final int yPixelStride = yPlane.bytesPerPixel!;

    // Conversion logic
    for (int y = 0; y < image.height; y++) {
      final int yRow = y * yPlane.bytesPerRow ~/ yPixelStride;

      for (int x = 0; x < image.width; x++) {
        final int uvIndex =
            (y ~/ 2) * uvRowStride + (x ~/ 2) * uvPixelStride;

        // Get YUV values
        final int yVal = yPlane.bytes[yRow + x * yPixelStride];
        final int uVal = uPlane.bytes[uvIndex];
        final int vVal = vPlane.bytes[uvIndex];

        // Convert YUV to RGB
        double r = (yVal + 1.402 * (vVal - 128)).clamp(0, 255);
        double g = (yVal - 0.344136 * (uVal - 128) - 0.714136 * (vVal - 128)).clamp(0, 255);
        double b = (yVal + 1.772 * (uVal - 128)).clamp(0, 255);

        // Set pixel in image
        frame.setPixelRgb(x, y, r, g, b);
      }
    }

    return frame;
  }

// 3. Fix BGRA8888 return type
  img.Image _convertBGRA8888(CameraImage image) {
    return img.Image.fromBytes(
      width: image.width,
      height: image.height,
      bytes: image.planes[0].bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
  }

  Future<void> _copyToClipboard() async {
    if (_translation.isEmpty) return;

    await Clipboard.setData(ClipboardData(text: _translation));

    // Show confirmation message
    ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Copied to clipboard!'),
          duration: Duration(seconds: 2),
        )
    );
  }

  final Map<String, String> _languages = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'tr': 'Turkish',
  };
  Future<void> _translateText() async {
    if (_translation.isEmpty || _selectedLanguage == null) return;

    setState(() => _isTranslating = true);

    try {
      final response = await http.post(
        Uri.parse('http://192.168.7.181:5000/api/translate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'text': _translation,
          'to': _selectedLanguage!,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => _translatedText = data['translatedText']);
      } else {
        setState(() => _translatedText = '⚠️ Translation Error');
      }
    } catch (e) {
      setState(() => _translatedText = '📡 Connection Error');
    } finally {
      setState(() => _isTranslating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // if (!_controller!.value.isInitialized) return Container(); //causes red screen replace with loading indicator
    if (_controller == null || !_controller!.value.isInitialized) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()), // Show loading indicator while initializing
      );
    }
    return Scaffold(
      // backgroundColor: Colors.amberAccent,
        appBar: AppBar(
          title: Text("Signfy", style: TextStyle(fontWeight: FontWeight.bold)),
          centerTitle: true,
          // backgroundColor: Colors.orangeAccent,
        ),
        body: SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Camera preview card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                    padding: EdgeInsets.all(12),
                    child: CameraPreview(_controller!)
                ),
              ),
              SizedBox(height: 12),

              // Buttons: clear and download
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(onPressed: () {
                    _generateSessionId();  // New session ID
                    setState(() => _translation = "");
                    // Optional: Call /reset_sentence endpoint
                  }, icon: Icon(Icons.clear), label: Text("امسح",style: TextStyle(fontWeight: FontWeight.bold)),),
                  ElevatedButton.icon(onPressed: _copyToClipboard, icon: Icon(Icons.copy), label: Text("انسخ",style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              SizedBox(height: 12),

              // Sign to Arabic translation
              SizedBox(
                height: 250,
                child: Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: SingleChildScrollView(
                      child: Container(
                        width: double.infinity,
                        child: Text(
                          _translation,
                          style: TextStyle(fontSize: 30),
                          softWrap: true, // This enables text wrapping
                          // maxLines: 2, // Optional: Limit to 2 lines if needed
                          // overflow: TextOverflow.ellipsis, // Handles overflow
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Translate to other language
              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: DropdownButtonFormField<String>(
                      value: _selectedLanguage,
                      decoration: InputDecoration(
                        labelText: "اختر اللغة",
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (String? newValue) {
                        setState(() => _selectedLanguage = newValue);
                      },
                      items: _languages.entries.map((entry){
                        return DropdownMenuItem<String>(
                          value: entry.key,
                          child: Text(entry.value),
                        );
                      }).toList(), // Fill with real language options
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _isTranslating ? null : _translateText,
                      child: _isTranslating
                          ? CircularProgressIndicator(color: Colors.white)
                          : Text("ترجم",style: TextStyle(fontWeight: FontWeight.bold),textScaleFactor: 1.3,),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16),

              // Final translation result
              SizedBox(
                height: 250,
                child: Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: SingleChildScrollView(
                      child: Container(
                        width: double.infinity,
                        child: Text(
                          _isTranslating ? "جاري الترجمة..." : _translatedText,
                          style: TextStyle(fontSize: 18),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        )
    );
  }
}