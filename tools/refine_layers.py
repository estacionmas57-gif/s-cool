import cv2
import numpy as np

# Load original
img = cv2.imread('assets/images/canada_hub_hero.jpg')
h, w = img.shape[:2]
b, g, r = cv2.split(img)

# 1. Refine Layer 1: Girl & Foreground
l1 = cv2.imread('assets/images/canada_layer1_girl.png', cv2.IMREAD_UNCHANGED)
if l1 is not None:
    alpha1 = l1[:, :, 3].copy()
    # Remove blue speech bubble and any badge remnants
    alpha1[50:230, 460:570] = 0
    alpha1[90:230, 560:640] = 0
    # Clean up right boundary beyond finger
    alpha1[:, 625:] = 0
    # Soften edge
    alpha1 = cv2.GaussianBlur(alpha1, (3, 3), 0)
    l1_clean = cv2.merge([b, g, r, alpha1])
    cv2.imwrite('assets/images/canada_layer1_girl.png', l1_clean)
    print("Refined assets/images/canada_layer1_girl.png")

# 2. Refine Layer 2: Icons
l2 = cv2.imread('assets/images/canada_layer2_icons.png', cv2.IMREAD_UNCHANGED)
if l2 is not None:
    alpha2 = l2[:, :, 3].copy()
    # Only keep the upper right quadrant where icons and flight lines live
    clean_icons_mask = np.zeros((h, w), dtype=np.uint8)
    clean_icons_mask[50:375, 455:840] = 255
    # Remove girl's hand/finger from icons
    cv2.ellipse(clean_icons_mask, (560, 305), (75, 50), -20, 0, 360, 0, -1)
    
    alpha2 = cv2.bitwise_and(alpha2, clean_icons_mask)
    alpha2 = cv2.GaussianBlur(alpha2, (3, 3), 0)
    l2_clean = cv2.merge([b, g, r, alpha2])
    cv2.imwrite('assets/images/canada_layer2_icons.png', l2_clean)
    print("Refined assets/images/canada_layer2_icons.png")

# 3. Create Wide Inpainted City Layer for smooth 15% parallax translation
# The city is in img[120:546, 450:1024].
# To let it shift horizontally by up to 60px without edge clipping, we create a canvas slightly wider (1140x546)
pad_w = 60
city_wide = np.zeros((h, w + pad_w * 2, 3), dtype=np.uint8)
# Place city image in center
city_wide[:, pad_w:pad_w + w] = img

# On the left, mirror/blend the trees and lake to allow sliding
left_patch = cv2.flip(img[:, 450:450 + pad_w], 1)
city_wide[:, 0:pad_w] = left_patch
# On the right, replicate border
city_wide[:, pad_w + w:] = cv2.flip(img[:, w - pad_w:w], 1)

cv2.imwrite('assets/images/canada_layer3_city_wide.jpg', city_wide)
print("Saved assets/images/canada_layer3_city_wide.jpg")
