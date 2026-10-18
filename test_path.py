import cv2, numpy as np
from PIL import Image, ImageDraw

# Create SVG string
path_d = (
    "M 1036 74 "
    "L 1099 74 "
    "A 32 32 0 1 1 1141 74 "
    "L 1204 74 "
    "A 40 40 0 0 1 1244 114 "
    "L 1244 134 "
    "A 40 40 0 0 1 1204 174 "
    "L 1137 174 "
    "A 22 22 0 1 1 1103 174 "
    "L 1036 174 "
    "A 40 40 0 0 1 996 134 "
    "L 996 114 "
    "A 40 40 0 0 1 1036 74 Z"
)

print("Unified path string:")
print(path_d)
