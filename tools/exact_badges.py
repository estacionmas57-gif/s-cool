import cv2
import numpy as np

img = cv2.imread('assets/images/canada_hub_hero.jpg')
h, w = img.shape[:2]
b, g, r = cv2.split(img)

alpha = np.zeros((h, w), dtype=np.uint8)

# The bounding box containing the 5 icons
roi = img[55:360, 460:835]
hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

sky_mask = cv2.inRange(hsv, (95, 45, 80), (125, 255, 255))
gray_sky = cv2.inRange(hsv, (90, 20, 140), (125, 80, 255))
sky_all = cv2.bitwise_or(sky_mask, gray_sky)

badge_content = cv2.bitwise_not(sky_all)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
badge_content = cv2.morphologyEx(badge_content, cv2.MORPH_OPEN, kernel)
badge_content = cv2.morphologyEx(badge_content, cv2.MORPH_CLOSE, kernel)

alpha[55:360, 460:835] = badge_content

# Clean boundaries:
# 1. Remove girl's hand/finger on the left
alpha[:, :615] = 0
# Except the French badge which is at x: 465..560, y: 60..185!
alpha[55:185, 465:560] = badge_content[0:130, 5:100]
# And British badge which is at x: 560..660, y: 105..225!
alpha[105:225, 560:660] = badge_content[50:170, 100:200]

# 2. Remove CN tower on the right
alpha[:, 790:] = 0
# Except Certificate star badge which is at x: 725..825, y: 235..355!
alpha[235:355, 725:825] = badge_content[180:300, 265:365]
# And remove any CN tower inside certificate region (spire is at x: 798..812)
# Spire above badge y < 240 is already removed!

# 3. Remove bottom buildings below icons:
alpha[350:, :] = 0

alpha_soft = cv2.GaussianBlur(alpha, (3, 3), 0)
icons_png = cv2.merge([b, g, r, alpha_soft])
cv2.imwrite('assets/images/canada_layer2_icons.png', icons_png)
print("Refined layer2 icons perfectly!")
