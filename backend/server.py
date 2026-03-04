from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

# Increase max content length to 1GB for large video uploads
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024

BUCKET_NAME = "testing-310892"

@app.post("/upload")
def upload():
    try:
        file = request.files.get("file")
        upload_type = request.form.get("uploadType")

        if not file:
            return jsonify({"message": "No file uploaded"}), 400

        filename = secure_filename(file.filename)
        temp_path = os.path.join(os.getcwd(), f"temp_{filename}")
        file.save(temp_path)

        folder = "livestreams/" if upload_type == "livestream" else "thumbnails/"
        remote_path = f"{folder}{filename}"

        print(f"Uploading {temp_path} to b2://{BUCKET_NAME}/{remote_path}")

        result = subprocess.run(
            ["b2", "file", "upload", BUCKET_NAME, temp_path, remote_path],
            capture_output=True,
            text=True,
        )

        # Clean up temp file regardless of success/failure
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if result.returncode != 0:
            print(f"Error uploading file to B2: {result.stderr}")
            return jsonify({"message": f"B2 Upload failed: {result.stderr}"}), 500

        return jsonify({"message": "Upload successful"})

    except Exception as e:
        print(f"An exception occurred during upload: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.get("/list-videos")
def list_videos():
    try:
        # Get download auth token
        auth_result = subprocess.run(
            ["b2", "bucket", "get-download-auth", BUCKET_NAME, "--duration", "86400"],
            capture_output=True,
            text=True,
        )
        
        token = ""
        if auth_result.returncode == 0:
            token = auth_result.stdout.strip()
            # If it's a JSON response, extract just the token string or handle accordingly
            # The CLI usually prints just the token for this command
        
        # Using b2 ls --recursive --json b2://BUCKET_NAME
        result = subprocess.run(
            ["b2", "ls", "--recursive", "--json", f"b2://{BUCKET_NAME}"],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"Error listing files: {result.stderr}")
            return jsonify({"message": result.stderr}), 500

        files = json.loads(result.stdout)
        
        videos = []
        for file in files:
            if file["fileName"].startswith("livestreams/") and file["fileName"].endswith(".mp4"):
                video_name = file["fileName"].replace("livestreams/", "")
                thumbnail_name = video_name.replace(".mp4", ".png") # Assuming thumbnail is png
                
                v_url = f"https://f004.backblazeb2.com/file/{BUCKET_NAME}/{file['fileName']}"
                t_url = f"https://f004.backblazeb2.com/file/{BUCKET_NAME}/thumbnails/{thumbnail_name}"
                
                if token:
                    v_url += f"?Authorization={token}"
                    t_url += f"?Authorization={token}"
                
                videos.append({
                    "id": file["fileId"],
                    "title": video_name,
                    "videoUrl": v_url,
                    "thumbnailUrl": t_url
                })

        return jsonify(videos)

    except Exception as e:
        print(f"An exception occurred in list_videos: {e}")
        return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)