import cv2

img = cv2.imread('assets/images/canada_hub_hero.jpg')

# Let's crop:
# French flag icon:
crop_fr = img[110:270, 465:560]
cv2.imwrite('scratch/crop_fr.png', crop_fr)

# Girl pointing finger:
crop_finger = img[270:370, 520:630]
cv2.imwrite('scratch/crop_finger.png', crop_finger)

# Toronto skyline (CN Tower & buildings):
crop_city = img[140:480, 550:1024]
cv2.imwrite('scratch/crop_city.png', crop_city)

print("Crops saved successfully.")
