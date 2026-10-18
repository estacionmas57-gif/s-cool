import cv2
import numpy as np

src_path = 'assets/images/canada_hub_hero.jpg'
img = cv2.imread(src_path)
h, w = img.shape[:2]

# 1. Base sky background (depth = 30)
depth = np.full((h, w), 30, dtype=np.uint8)

# 2. Clouds and airplane (depth = 50)
cv2.ellipse(depth, (920, 160), (100, 65), -15, 0, 360, 50, -1) # Airplane
cv2.ellipse(depth, (340, 155), (75, 45), 0, 0, 360, 50, -1)   # Cloud left
cv2.ellipse(depth, (520, 410), (65, 35), 0, 0, 360, 55, -1)   # Cloud mid
cv2.ellipse(depth, (890, 415), (90, 50), 0, 0, 360, 55, -1)   # Cloud right

# 3. Lake Ontario (depth = 80)
depth[440:546, 450:1024] = 80
# Sailboats
cv2.rectangle(depth, (605, 420), (665, 480), 95, -1)
cv2.rectangle(depth, (900, 415), (965, 485), 95, -1)

# 4. Toronto Skyline (depth = 120, user: 15% movement)
city_poly = np.array([
    [470, 440], [530, 290], [580, 320], [640, 320], [670, 335],
    [700, 345], [740, 360], [780, 360], [795, 140], [815, 140],
    [825, 360], [860, 240], [920, 370], [960, 300], [1024, 320],
    [1024, 450], [470, 450]
], np.int32)
cv2.fillPoly(depth, [city_poly], 120)
# Rogers dome & CN Tower
cv2.rectangle(depth, (798, 140), (812, 440), 125, -1)
cv2.ellipse(depth, (715, 400), (75, 45), 0, 0, 360, 130, -1)

# 5. Floating Badges / Icons (depth = 175, user: 10% movement)
badge_boxes = [
    (465, 60, 560, 185),   # French
    (560, 105, 665, 230),  # British
    (665, 145, 765, 265),  # Calendar
    (625, 220, 725, 335),  # Checklist
    (725, 235, 830, 355),  # Certificate
]
for (x1, y1, x2, y2) in badge_boxes:
    cv2.rectangle(depth, (x1, y1), (x2, y2), 175, -1)

# Flight dotted lines
flight_poly = np.array([
    [480, 120], [580, 100], [700, 190], [800, 290], [750, 360],
    [630, 280], [520, 210]
], np.int32)
cv2.polylines(depth, [flight_poly], False, 170, 10)

# 6. Foreground: Girl, Clothes, Books, Flag, Autumn Leaves (depth = 245, user: 5% movement)
# Load clean girl mask
fg_mask = cv2.imread('assets/images/canada_layer1_girl.png', cv2.IMREAD_UNCHANGED)
if fg_mask is not None:
    alpha = fg_mask[:, :, 3]
    # Fill any internal holes (eyes, earrings, hair) with morphological closing
    kernel_fill = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))
    alpha_solid = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel_fill)
    
    # Ensure the Canadian flag on the upper left is included in foreground
    cv2.rectangle(alpha_solid, (40, 30), (280, 260), 255, -1)
    
    # Exclude right-side badges region from foreground girl
    alpha_solid[:, 625:] = 0
    alpha_solid[60:220, 465:560] = 0 # French badge area
    alpha_solid[105:220, 560:630] = 0 # British badge area
    
    depth = np.where(alpha_solid > 80, 245, depth)

# 7. Final high-quality anti-aliased edge smoothing
depth_final = cv2.GaussianBlur(depth, (7, 7), 0)

out_depth = 'assets/images/canada_depth_map.png'
cv2.imwrite(out_depth, depth_final)
print("Saved perfect depth map:", out_depth)
