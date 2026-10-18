import cv2
import numpy as np
from PIL import Image

src_path = 'assets/images/canada_hub_hero.jpg'
img_bgr = cv2.imread(src_path)
h, w = img_bgr.shape[:2]
print(f"Loaded image: {w}x{h}")

# Let's inspect coordinates of key regions:
# 1. Girl & foliage: roughly from x=0 to x=640 (left to center-right pointing finger)
#    Flag: x=40..280, y=50..250
#    Girl face: x=250..420, y=180..380
#    Finger: x=500..630, y=260..340
#    Coat/backpack: x=50..520, y=300..546
# 2. Icons: roughly x=460..820, y=90..340
# 3. Skyline: x=480..1024, y=220..546
# 4. Sky: y=0..300, especially right half x=450..1024, y=0..250

print("Base dimensions verified.")
