import cv2
import numpy as np
from PIL import Image

src_path = 'assets/images/canada_hub_hero.jpg'
img = cv2.imread(src_path)
h, w = img.shape[:2]

# ==========================================
# 1. LAYER 2: EXTRACT FLOATING ICONS
# ==========================================
# The icons are 5 white rounded squircle badges floating in the upper-right quadrant
# Let's create an accurate mask for the icons + dashed lines
# Icon approximate locations:
# Icon 1 (French): x=470..560, y=110..260
# Icon 2 (British): x=570..660, y=190..360
# Icon 3 (Calendar): x=670..760, y=280..425
# Icon 4 (Checklist): x=630..720, y=415..535 (note: y in image is 0 at top, so around 420..540 is bottom)
# Wait, let's look at y coordinates:
# Image height is 546.
# Let's inspect the exact coordinates of the icons:

# French flag icon: x=470..560, y=120..260
# British flag icon: x=570..660, y=200..360
# Wait! Let's check where the icons are in y:
# The top icon is French (around y=110..220)
# Below that is British (around y=190..300)
# To the right of British is Calendar (around y=280..380)
# Below finger is Checklist and Certificate!

# Let's write an inspector to get bounding boxes of the white badge regions
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# Badges are bright white/felt
# Let's find white badges by thresholding in HSV or RGB
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# White badges have high value and low saturation, or let's create custom polygon masks
# Let's inspect the coordinates by saving a grid image
grid_img = img.copy()
for x in range(0, w, 50):
    cv2.line(grid_img, (x, 0), (x, h), (0, 255, 0), 1)
    cv2.putText(grid_img, str(x), (x + 2, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
for y in range(0, h, 50):
    cv2.line(grid_img, (0, y), (w, y), (0, 255, 0), 1)
    cv2.putText(grid_img, str(y), (10, y + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)

cv2.imwrite('scratch/grid_coords.png', grid_img)
print("Saved scratch/grid_coords.png to verify coordinates")
