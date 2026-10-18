import cv2
import os
import shutil

video_path = r'assets/Nuevos cambios/www2.mp4'
output_dir = r'scratch/ultimos_2_segundos'
artifact_dir = r'C:/Users/estac/.gemini/antigravity-ide/brain/b2b9e79c-333e-45db-982b-0cec8017693f'

os.makedirs(output_dir, exist_ok=True)
os.makedirs(artifact_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
duration = total_frames / fps

print(f"Video: {video_path}")
print(f"Resolution: {width}x{height}, Total frames: {total_frames}, FPS: {fps:.2f}, Duration: {duration:.2f}s")

# Last 2 seconds: from (duration - 2.0) to duration
start_time = max(0.0, duration - 2.0)
start_frame = int(round(start_time * fps))

print(f"Extracting frames from frame {start_frame} ({start_time:.2f}s) to {total_frames - 1} ({duration:.2f}s)...")

extracted_count = 0
key_frames = []

for frame_idx in range(start_frame, total_frames):
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if not ret:
        print(f"Warning: could not read frame {frame_idx}")
        continue
    
    current_sec = frame_idx / fps
    filename = f"frame_{frame_idx:04d}_sec_{current_sec:05.2f}.png"
    filepath = os.path.join(output_dir, filename)
    cv2.imwrite(filepath, frame, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    extracted_count += 1
    
    # Select key candidates to present to user (e.g. 8.0s, 8.5s, 9.0s, 9.5s, 10.0s)
    # Also the very last frame
    if frame_idx in [start_frame, start_frame + 12, start_frame + 24, start_frame + 36, total_frames - 1]:
        key_frames.append((frame_idx, current_sec, filepath))

cap.release()
print(f"Successfully extracted {extracted_count} frames to {output_dir}")

# Copy key candidates to artifact directory for presentation
for idx, sec, path in key_frames:
    art_filename = f"last_2s_frame_{idx}_sec_{sec:.2f}.png"
    art_path = os.path.join(artifact_dir, art_filename)
    shutil.copyfile(path, art_path)
    print(f"Copied key frame to artifact: {art_path}")

# Specifically name the final frame for immediate use
final_frame_src = key_frames[-1][2]
final_frame_dst = os.path.join(artifact_dir, "final_frame_seed.png")
shutil.copyfile(final_frame_src, final_frame_dst)
print(f"Saved final frame seed: {final_frame_dst}")
