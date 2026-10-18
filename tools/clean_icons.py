import cv2
import numpy as np

img = cv2.imread('assets/images/canada_hub_hero.jpg')
h, w = img.shape[:2]
b, g, r = cv2.split(img)

# Define exact rounded rectangle masks for the 5 badges
alpha = np.zeros((h, w), dtype=np.uint8)

# Badge 1: French
cv2.rectangle(alpha, (465, 60), (555, 180), 255, -1)
# Badge 2: British
cv2.rectangle(alpha, (565, 105), (660, 225), 255, -1)
# Badge 3: Calendar
cv2.rectangle(alpha, (670, 145), (755, 260), 255, -1)
# Badge 4: Checklist
cv2.rectangle(alpha, (632, 222), (720, 330), 255, -1)
# Badge 5: Certificate
cv2.rectangle(alpha, (730, 235), (820, 350), 255, -1)

# Flight lines (connecting the badges)
# Line 1: French to British
cv2.line(alpha, (510, 155), (600, 150), 255, 5)
# Line 2: British to Calendar
cv2.line(alpha, (615, 150), (690, 175), 255, 5)
# Line 3: French to Checklist (loop)
pts1 = np.array([[510, 175], [540, 220], [630, 250]], np.int32)
cv2.polylines(alpha, [pts1], False, 255, 5)
# Line 4: Checklist to Certificate
cv2.line(alpha, (715, 280), (740, 285), 255, 5)

# Also sparkle accents around icons
# Calendar sparkle:
cv2.circle(alpha, (765, 150), 12, 255, -1)
# Certificate sparkle:
cv2.circle(alpha, (830, 255), 14, 255, -1)

# Edge softening
alpha_clean = cv2.GaussianBlur(alpha, (5, 5), 0)

clean_icons = cv2.merge([b, g, r, alpha_clean])
cv2.imwrite('assets/images/canada_layer2_icons.png', clean_icons)
print("Ultra clean assets/images/canada_layer2_icons.png generated!")
