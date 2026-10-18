import subprocess, os
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@700;800&family=Poppins:wght@700;800;900&display=swap" rel="stylesheet">
<style>
body { background: #000; color: #fff; margin: 0; padding: 20px; }
.test { font-size: 52px; margin-bottom: 25px; line-height: 1; }
.w-outfit-800 { font-family: 'Outfit'; font-weight: 800; }
.w-outfit-900 { font-family: 'Outfit'; font-weight: 900; }
.w-jakarta-800 { font-family: 'Plus Jakarta Sans'; font-weight: 800; }
.w-poppins-800 { font-family: 'Poppins'; font-weight: 800; }
.w-poppins-900 { font-family: 'Poppins'; font-weight: 900; }
</style>
</head>
<body>
<div class="test w-outfit-800" id="o8">Colegio</div>
<div class="test w-outfit-900" id="o9">Colegio</div>
<div class="test w-jakarta-800" id="j8">Colegio</div>
<div class="test w-poppins-800" id="p8">Colegio</div>
<div class="test w-poppins-900" id="p9">Colegio</div>
</body>
</html>"""

with open('font_detail_test.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
out_path = os.path.abspath('font_detail.png')
subprocess.run([edge, '--headless=new', '--disable-gpu', '--window-size=1000,600', f'--screenshot={out_path}', 'file:///' + os.path.abspath('font_detail_test.html')], capture_output=True)

img = Image.open('font_detail.png')
ref = Image.open('text_colegio_clean.png')
print('Ref size:', ref.size)

# Find bounding boxes of rendered Colegio in font_detail.png
arr = np.array(img)
white = (arr[:, :400, 0] > 200)
# Find vertical runs
y_dens = np.sum(white, axis=1)
in_b = False
blocks = []
st = 0
for y, v in enumerate(y_dens):
    if v > 5 and not in_b:
        in_b = True
        st = y
    elif v <= 5 and in_b:
        in_b = False
        if y - st > 15:
            blocks.append((st, y))

names = ['Outfit 800', 'Outfit 900', 'Jakarta 800', 'Poppins 800', 'Poppins 900']
for i, (b_s, b_e) in enumerate(blocks[:len(names)]):
    crop = img.crop((20, b_s, 300, b_e))
    # trim horizontally
    cr_arr = np.array(crop)
    col_w = np.sum(cr_arr[:, :, 0] > 200, axis=0)
    xs = np.where(col_w > 0)[0]
    if len(xs) > 0:
        w = xs[-1] - xs[0]
        h = b_e - b_s
        print(f'{names[i]}: W={w}, H={h}, aspect={w/h:.2f}')

print(f'Ref Colegio: W={ref.size[0]}, H={ref.size[1]}, aspect={ref.size[0]/ref.size[1]:.2f}')
