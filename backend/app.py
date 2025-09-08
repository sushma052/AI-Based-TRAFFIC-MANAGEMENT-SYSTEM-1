from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import threading
import time

from yolov4 import detect_cars
from algo import optimize_traffic

app = Flask(__name__)
CORS(app)

# Global variables to store current green times and AI control state
current_green_times = {
    "NORTH": 30,
    "SOUTH": 30,
    "EAST": 30,
    "WEST": 30
}
ai_schedule_active = True  # Flag to check if AI is controlling timings

@app.route('/upload', methods=['POST'])
def upload_files():
    """
    Handle video uploads, detect cars, and optimize traffic.
    """
    files = request.files.getlist('videos')
    if len(files) != 4:
        return jsonify({'error': 'Please upload exactly 4 videos'}), 400

    # Save uploaded videos
    video_paths = []
    for i, file in enumerate(files):
        video_path = os.path.join('uploads', f'video_{i}.mp4')
        file.save(video_path)
        video_paths.append(video_path)

    # Count cars in each video
    num_cars_list = []
    for video_file in video_paths:
        num_cars = detect_cars(video_file)
        num_cars_list.append(num_cars)

    # Run optimization algorithm
    result = optimize_traffic(num_cars_list)

    return jsonify(result)


# ✅ Emergency Vehicle Route with lane selection
@app.route('/emergency', methods=['POST'])
def emergency():
    """
    Emergency vehicle mode: override timings for the selected lane for 10 seconds
    """
    global ai_schedule_active, current_green_times
    data = request.json
    lane = data.get("lane", "NORTH").upper()

    def priority_override(lane):
        global ai_schedule_active, current_green_times
        ai_schedule_active = False  # Pause AI optimization temporarily
        # Set emergency lane green, other lanes short/red
        for l in current_green_times:
            current_green_times[l] = 30 if l == lane else 10
        print(f"🚨 Emergency vehicle detected in {lane}! Priority given for 10 seconds...")
        time.sleep(10)  # Emergency duration
        ai_schedule_active = True  # Resume AI optimization
        print("✅ Emergency over, AI timings resumed.")

    # Run emergency override in a separate thread
    threading.Thread(target=priority_override, args=(lane,)).start()

    return jsonify({"message": f"🚨 Emergency vehicle in {lane} lane! Priority given for 10 seconds."})


if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)

