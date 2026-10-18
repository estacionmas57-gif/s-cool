import os, subprocess
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1024px;
      height: 341px;
      overflow: hidden;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7.5px;
    }

    .holo-card {
      position: relative;
      width: 320px;
      height: 177px;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Pure cerulean-cyan glass gradient */
      background: linear-gradient(180deg, 
        #529ef0 0%, 
        #5995d8 14%, 
        #5389cd 35%, 
        #4e84cb 65%, 
        #5595d7 84%, 
        #5cbdfa 100%
      );

      /* Electric cyan glowing neon border */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.75),
        0 0 22px rgba(0, 215, 255, 0.42),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.85),
        inset 0 0 12px rgba(0, 230, 255, 0.5),
        inset 0 -3px 8px rgba(0, 240, 255, 0.6);
    }

    /* Top-left specular pill reflection */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 14px;
      left: 20px;
      width: 76px;
      height: 10px;
      border-radius: 8px;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.75) 40%, 
        rgba(255, 255, 255, 0.15) 80%, 
        transparent 100%
      );
      filter: blur(0.8px);
      pointer-events: none;
      z-index: 2;
    }

    /* Subtle top specular arch */
    .holo-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 10%;
      right: 10%;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0.8) 70%, transparent 100%);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-weight: 800;
      font-size: 46.5px;
      letter-spacing: -0.02em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.35),
        0 0 12px rgba(56, 189, 248, 0.6);
    }

    .holo-card.double-line span {
      font-size: 37px;
      line-height: 1.08;
      letter-spacing: -0.015em;
    }
  </style>
</head>
<body>
  <div class="holo-card">
    <span>Colegio</span>
  </div>
  <div class="holo-card">
    <span>Canadá</span>
  </div>
  <div class="holo-card double-line">
    <span>Emisora<br>Digital</span>
  </div>
</body>
</html>
"""

with open('tune_v3.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v3.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v3.html')
], capture_output=True)

ref_img = Image.open('card2_ref.png')
ref = Image.new('RGB', ref_img.size, (255, 255, 255))
ref.paste(ref_img, mask=ref_img.split()[3])

ren = Image.open(png_file).convert('RGB').crop((352, 82, 352+319, 82+177))

alpha_mask = np.array(ref_img.split()[3]) > 220
diff = np.abs(np.array(ref).astype(float) - np.array(ren).astype(float))
print(f'tune_v3 Card 2 MAE inside body: {np.mean(diff[alpha_mask]):.2f}')

# Full comp
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v3_comp.png')
print('tune_v3_comp.png saved')
