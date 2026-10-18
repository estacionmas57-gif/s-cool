import cv2
import numpy as np

src_path = 'assets/images/canada_hub_hero.jpg'
img = cv2.imread(src_path)
h, w = img.shape[:2]

# -------------------------------------------------------------
# 1. LAYER 2: FLOATING ICONS
# -------------------------------------------------------------
# Icons bounding box region: x: 450..845, y: 40..370
# The badges are white/colored felt with clear edges against the blue sky/buildings
icons_mask = np.zeros((h, w), dtype=np.uint8)

# Define precise bounding boxes for each badge + connection lines
badge_boxes = [
    (460, 60, 560, 185),   # French
    (560, 105, 665, 230),  # British
    (665, 145, 765, 265),  # Calendar
    (625, 220, 725, 335),  # Checklist
    (725, 235, 830, 355),  # Certificate
]

# Create mask for badges
for (x1, y1, x2, y2) in badge_boxes:
    # Circle/rounded rectangle inside the box
    cv2.rectangle(icons_mask, (x1, y1), (x2, y2), 255, -1)

# Also capture the connecting dashed flight lines between the badges
flight_lines_poly = np.array([
    [480, 120], [530, 80], [580, 100], [670, 150], [700, 190],
    [750, 240], [800, 290], [750, 360], [670, 340], [620, 280],
    [580, 230], [520, 210], [480, 150]
], np.int32)
cv2.fillPoly(icons_mask, [flight_lines_poly], 255)

# Mask out girl's hand/finger from icons mask
# Hand is at x < 615 and y > 240..340
hand_mask = np.zeros((h, w), dtype=np.uint8)
cv2.ellipse(hand_mask, (550, 300), (70, 45), -20, 0, 360, 255, -1)
icons_mask[hand_mask > 0] = 0

# Refine icons mask with color/edge segmentation
# Inside the icon regions, find the white felt badge & colorful symbols & dashed lines
icon_region = cv2.bitwise_and(img, img, mask=icons_mask)
# Badges and dashed lines have high contrast or white/bright tones or specific colors
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# Sky in this region is cyan/blue: H: 95..125, S: 80..255
# Buildings are blue/gray
# We keep pixels that are NOT sky blue
not_sky = cv2.inRange(hsv, (90, 60, 80), (125, 255, 255))
# Invert: keep everything that is not pure sky
icons_content = cv2.bitwise_not(not_sky)
final_icons_mask = cv2.bitwise_and(icons_mask, icons_content)

# Morphological clean up
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
final_icons_mask = cv2.morphologyEx(final_icons_mask, cv2.MORPH_CLOSE, kernel)
final_icons_mask = cv2.GaussianBlur(final_icons_mask, (3, 3), 0)

b, g, r = cv2.split(img)
layer2_icons = cv2.merge([b, g, r, final_icons_mask])
cv2.imwrite('assets/images/canada_layer2_icons.png', layer2_icons)
print("Saved assets/images/canada_layer2_icons.png")


# -------------------------------------------------------------
# 2. LAYER 1: FOREGROUND (GIRL, FOLIAGE, CANADIAN FLAG)
# -------------------------------------------------------------
# Foreground is x: 0..625, y: 0..546
fg_mask = np.zeros((h, w), np.uint8)
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)
rect_fg = (0, 10, 625, h - 15)
cv2.grabCut(img, fg_mask, rect_fg, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
mask_fg_clean = np.where((fg_mask == 2) | (fg_mask == 0), 0, 255).astype('uint8')
mask_fg_clean[:, 622:] = 0

# Remove any icon overlap from foreground
mask_fg_clean[final_icons_mask > 200] = 0

# Smooth alpha edge
alpha_fg = cv2.GaussianBlur(mask_fg_clean, (5, 5), 0)
layer1_fg = cv2.merge([b, g, r, alpha_fg])
cv2.imwrite('assets/images/canada_layer1_girl.png', layer1_fg)
print("Saved assets/images/canada_layer1_girl.png")


# -------------------------------------------------------------
# 3. LAYER 3: TORONTO SKYLINE & LAKE
# -------------------------------------------------------------
# The city starts around x=480, y=130 down to bottom (y=546)
city_img = img.copy()
# Remove icons by inpainting using Telea algorithm
inpaint_mask = cv2.dilate(final_icons_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
city_clean = cv2.inpaint(city_img, inpaint_mask, 5, cv2.INPAINT_TELEA)

# For the area behind the girl (x < 520), inpaint/extend the lake and trees
# Create a seamless wide background for horizontal parallax
city_layer = city_clean.copy()

# Cut out sky above city skyline so sky can be in Layer 4
# Sky threshold: top-right sky is blue
city_alpha = np.ones((h, w), dtype=np.uint8) * 255
# Sky region in upper right: y < 140, x > 500
sky_hsv = cv2.cvtColor(city_clean, cv2.COLOR_BGR2HSV)
sky_mask = cv2.inRange(sky_hsv, (95, 70, 140), (120, 255, 255))
sky_mask[200:, :] = 0  # Only upper sky
# Keep CN tower (spire around x=805)
sky_mask[:, 795:815] = 0

city_alpha[sky_mask > 0] = 0
city_alpha_blur = cv2.GaussianBlur(city_alpha, (5, 5), 0)

cb, cg, cr = cv2.split(city_clean)
layer3_city = cv2.merge([cb, cg, cr, city_alpha_blur])
cv2.imwrite('assets/images/canada_layer3_city.png', layer3_city)
print("Saved assets/images/canada_layer3_city.png")


# -------------------------------------------------------------
# 4. LAYER 4: SKY, CLOUDS & AIRPLANE
# -------------------------------------------------------------
# Sky background with cotton clouds and airplane
sky_layer = img.copy()
# Inpaint out foreground girl so sky and clouds extend naturally across the entire width
fg_to_inpaint = cv2.dilate(mask_fg_clean, cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15)))
# Only inpaint upper portion (sky/cloud level)
fg_to_inpaint[280:, :] = 0
sky_clean = cv2.inpaint(sky_layer, fg_to_inpaint, 9, cv2.INPAINT_TELEA)
cv2.imwrite('assets/images/canada_layer4_sky.jpg', sky_clean)
print("Saved assets/images/canada_layer4_sky.jpg")

print("All 4 layers extracted successfully!")
