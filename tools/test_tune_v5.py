import os, subprocess
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&family=Outfit:wght@800&display=swap" rel="stylesheet">
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
      gap: 12px;
      padding: 0 20px;
    }

    .holo-card {
      position: relative;
      width: 318px;
      height: 175px;
      border-radius: 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Pure cerulean jelly gradient */
      background: radial-gradient(120% 100% at 50% 50%, 
        #4d8ad4 0%, 
        #417ec9 45%, 
        #3b76c0 70%, 
        #366fb8 100%
      );

      /* Electric cyan glowing neon border with inner channel and bevel */
      border: 2px solid #00f0ff;
      box-shadow: 
        0 0 8px rgba(0, 240, 255, 0.85),
        0 0 20px rgba(0, 215, 255, 0.5),
        inset 0 0 0 3px rgba(16, 75, 150, 0.7),
        inset 0 0 12px rgba(0, 230, 255, 0.6),
        inset 0 2px 4px rgba(255, 255, 255, 0.9),
        inset 0 -3px 8px rgba(0, 240, 255, 0.7);
    }

    /* Inner glass body contour */
    .holo-card-inner {
      position: absolute;
      inset: 4px;
      border-radius: 21px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.22) 0%, 
        rgba(255, 255, 255, 0.04) 40%, 
        rgba(0, 220, 255, 0.08) 80%,
        rgba(0, 230, 255, 0.25) 100%
      );
      pointer-events: none;
      z-index: 1;
    }

    /* Organic top-left specular reflection streak */
    .holo-card-gloss {
      position: absolute;
      top: 10px;
      left: 18px;
      width: 78px;
      height: 12px;
      border-radius: 12px;
      background: radial-gradient(ellipse at 35% 50%, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(255, 255, 255, 0.75) 45%, 
        rgba(255, 255, 255, 0.15) 75%, 
        transparent 100%
      );
      filter: blur(0.6px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 51px;
      letter-spacing: -0.015em;
      line-height: 1;
      text-shadow: 
        0 2px 5px rgba(0, 20, 65, 0.4),
        0 0 12px rgba(56, 189, 248, 0.65);
    }

    .holo-card.double-line span {
      font-size: 42px;
      line-height: 1.05;
      letter-spacing: -0.015em;
    }
  </style>
</head>
<body>
  <div class="holo-card">
    <div class="holo-card-inner"></div>
    <div class="holo-card-gloss"></div>
    <span>Colegio</span>
  </div>
  <div class="holo-card">
    <div class="holo-card-inner"></div>
    <div class="holo-card-gloss"></div>
    <span>Canadá</span>
  </div>
  <div class="holo-card double-line">
    <div class="holo-card-inner"></div>
    <div class="holo-card-gloss"></div>
    <span>Emisora<br>Digital</span>
  </div>
</body>
</html>
"""

with open('tune_v5.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v5.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v5.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v5_comp.png')
print('tune_v5_comp.png saved')
