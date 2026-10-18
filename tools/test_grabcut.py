import cv2
import numpy as np

img = cv2.imread('assets/images/canada_hub_hero.jpg')
h, w = img.shape[:2]

# Let's inspect brightness and edges
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

print(f"Dimensions: width={w}, height={h}")

# Let's test a grabcut for the girl and foreground foliage
# The girl and foreground trees occupy roughly x from 0 to 630
mask_fg = np.zeros((h, w), np.uint8)
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

# Foreground rectangle: girl, flag, and bottom-left maple leaves
rect = (0, 20, 635, h - 25)
cv2.grabCut(img, mask_fg, rect, bgdModel, fgdModel, 4, cv2.GC_INIT_WITH_RECT)

# In mask_fg, values 0 and 2 are background, 1 and 3 are foreground
mask2 = np.where((mask_fg == 2) | (mask_fg == 0), 0, 1).astype('uint8')

# Exclude the right side past finger x > 635
mask2[:, 635:] = 0

fg_extracted = img * mask2[:, :, np.newaxis]
alpha = (mask2 * 255).astype(np.uint8)

# Smooth edges with slight blur for anti-aliasing
alpha_blur = cv2.GaussianBlur(alpha, (5, 5), 0)

b, g, r = cv2.split(img)
rgba = cv2.merge([b, g, r, alpha_blur])

cv2.imwrite('scratch/layer1_girl_test.png', rgba)
print("Saved scratch/layer1_girl_test.png")
