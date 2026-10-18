import os, subprocess
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&display=swap" rel="stylesheet">
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
      gap: 9px;
    }

    .holo-card {
      position: relative;
      width: 320px;
      height: 177px;
      border-radius: 25px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Exact lighter cerulean glass background */
      background: linear-gradient(180deg, 
        #79bdf5 0%, 
        #65aee8 12%, 
        #599fdc 32%, 
        #5295d2 58%, 
        #5092d0 78%, 
        #5ba0dc 90%, 
        #4ec2fc 100%
      );

      /* Electric cyan glowing neon outer border */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.8),
        0 0 22px rgba(0, 215, 255, 0.45),
        inset 0 0 0 3px rgba(25, 95, 175, 0.75); /* Trough between borders */
    }

    /* Inner glowing cyan rim with top specular line */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 21px;
      border: 1.5px solid #28e2ff;
      border-top-color: #ffffff;
      box-shadow: 
        0 0 6px rgba(0, 240, 255, 0.6),
        inset 0 1.5px 3px rgba(255, 255, 255, 0.95),
        inset 0 0 12px rgba(0, 220, 255, 0.5),
        inset 0 -3px 8px rgba(0, 240, 255, 0.75);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.26) 0%, 
        rgba(255, 255, 255, 0.05) 25%, 
        transparent 65%,
        rgba(0, 220, 255, 0.16) 100%
      );
      pointer-events: none;
      z-index: 1;
    }

    /* Soft organic gloss sheen across top-left */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 16px;
      width: 75px;
      height: 14px;
      border-radius: 12px;
      background: radial-gradient(ellipse at 35% 40%, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(255, 255, 255, 0.7) 40%, 
        rgba(255, 255, 255, 0.15) 75%, 
        transparent 100%
      );
      filter: blur(1.2px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 51px;
      letter-spacing: -0.01em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 20, 60, 0.35),
        0 0 16px rgba(56, 189, 248, 0.75);
    }

    .holo-card.double-line span {
      font-size: 41px;
      line-height: 1.05;
      letter-spacing: -0.01em;
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

with open('tune_v10.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v10.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v10.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v10_comp.png')
print('tune_v10_comp.png saved')
