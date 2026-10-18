import cv2
import os
import shutil
import numpy as np

video_path = r'assets/Nuevos cambios/www2.mp4'
backup_path = r'assets/Nuevos cambios/www2_full_backup.mp4'
trimmed_video_path = r'assets/Nuevos cambios/www2_trimmed.mp4'
frames_dir = r'assets/frames_inicio'
TOTAL_WEB_FRAMES = 120
CUT_FRAME = 210 # Inclusive (0 to 210)

print(f"Loading {video_path}...")
cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Original video: {total_frames} frames, {fps:.2f} FPS, {width}x{height}")
print(f"Trimming up to frame {CUT_FRAME} (duration: {CUT_FRAME/fps:.2f}s)...")

# Make backup of original if not already backed up
if not os.path.exists(backup_path):
    shutil.copyfile(video_path, backup_path)
    print(f"Created backup at {backup_path}")

# Read all frames up to CUT_FRAME
frames = []
for i in range(CUT_FRAME + 1):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ret, frame = cap.read()
    if not ret:
        print(f"Failed to read frame {i}")
        break
    frames.append(frame)

cap.release()
print(f"Read {len(frames)} frames.")

# 1. Export trimmed MP4 video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(trimmed_video_path, fourcc, fps, (width, height))
for f in frames:
    out.write(f)
out.release()
print(f"Saved trimmed video: {trimmed_video_path}")

# 2. Re-sample 120 WebP frames for website scroll (1280x720)
os.makedirs(frames_dir, exist_ok=True)
WEB_WIDTH = 1280
WEB_HEIGHT = 720

print(f"Re-sampling {TOTAL_WEB_FRAMES} frames into {frames_dir}...")
for web_idx in range(1, TOTAL_WEB_FRAMES + 1):
    # Linear interpolation from 0 to CUT_FRAME
    src_idx = int(round((web_idx - 1) * CUT_FRAME / (TOTAL_WEB_FRAMES - 1)))
    src_frame = frames[src_idx]
    
    # Resize to 1280x720 for web performance
    resized = cv2.resize(src_frame, (WEB_WIDTH, WEB_HEIGHT), interpolation=cv2.INTER_AREA)
    
    out_filename = f"frame_{web_idx:04d}.webp"
    out_path = os.path.join(frames_dir, out_filename)
    
    # WebP quality 85
    cv2.imwrite(out_path, resized, [cv2.IMWRITE_WEBP_QUALITY, 85])

print(f"Successfully generated all {TOTAL_WEB_FRAMES} frames in {frames_dir}.")
print(f"Frame 120 is now EXACTLY frame {CUT_FRAME} of the trimmed video!")
