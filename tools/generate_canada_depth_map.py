import cv2
import numpy as np

src_path = 'assets/images/canada_hub_hero.jpg'
img = cv2.imread(src_path)
h, w = img.shape[:2]

# Initialize depth map with background sky level
depth = np.full((h, w), 35, dtype=np.uint8)

# 1. Airplane & clouds in sky: depth ~ 45
airplane_cloud_mask = np.zeros((h, w), dtype=np.uint8)
cv2.ellipse(airplane_cloud_mask, (920, 160), (90, 60), -15, 0, 360, 255, -1)
# Clouds in sky
cv2.ellipse(airplane_cloud_mask, (340, 160), (70, 40), 0, 0, 360, 255, -1)
cv2.ellipse(airplane_cloud_mask, (520, 420), (60, 30), 0, 0, 360, 255, -1)
cv2.ellipse(airplane_cloud_mask, (900, 420), (80, 45), 0, 0, 360, 255, -1)
depth[airplane_cloud_mask > 0] = 50

# 2. Lake Ontario and waterfront trees: depth ~ 90
lake_mask = np.zeros((h, w), dtype=np.uint8)
lake_mask[430:546, 450:1024] = 255
depth[lake_mask > 0] = 90

# 3. Toronto Skyline (CN Tower, dome, skyscrapers): depth ~ 125
city_mask = np.zeros((h, w), dtype=np.uint8)
# City polygon
city_poly = np.array([
    [480, 440], [530, 290], [580, 320], [640, 320], [670, 340],
    [700, 350], [740, 370], [780, 370], [795, 140], [815, 140],
    [825, 370], [860, 240], [920, 380], [960, 300], [1024, 320],
    [1024, 480], [480, 480]
], np.int32)
cv2.fillPoly(city_mask, [city_poly], 255)
# CN Tower full height
cv2.rectangle(city_mask, (798, 140), (812, 450), 255, -1)
depth[city_mask > 0] = 125

# 4. Floating Badges / Icons: depth ~ 185 (User: "iconos ≈ 10%")
icons_mask = np.zeros((h, w), dtype=np.uint8)
badge_boxes = [
    (465, 60, 560, 185),   # French
    (560, 105, 665, 230),  # British
    (665, 145, 765, 265),  # Calendar
    (625, 220, 725, 335),  # Checklist
    (725, 235, 830, 355),  # Certificate
]
for (x1, y1, x2, y2) in badge_boxes:
    cv2.rectangle(icons_mask, (x1, y1), (x2, y2), 255, -1)

# Flight lines
flight_poly = np.array([
    [480, 120], [580, 100], [700, 190], [800, 290], [750, 360],
    [630, 280], [520, 210]
], np.int32)
cv2.polylines(icons_mask, [flight_poly], False, 255, 12)
depth[icons_mask > 0] = 185

# 5. Foreground: Girl, Flag, Autumn Leaves: depth ~ 245 (User: "personaje ≈ 5%")
fg_mask = cv2.imread('assets/images/canada_layer1_girl.png', cv2.IMREAD_UNCHANGED)
if fg_mask is not None:
    alpha = fg_mask[:, :, 3]
    # Set girl and foreground to 245
    depth = np.where(alpha > 120, 245, depth)

# Smooth transition with guided blur for natural 3D displacement
depth_smooth = cv2.GaussianBlur(depth, (15, 15), 0)

cv2.imwrite('assets/images/canada_depth_map.png', depth_smooth)
print("Saved assets/images/canada_depth_map.png")
