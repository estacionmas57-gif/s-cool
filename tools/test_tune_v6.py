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
      gap: 9px;
      padding: 0 16px;
    }

    .holo-card {
      position: relative;
      width: 320px;
      height: 176px;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Exact cerulean glass background from pixel profiling */
      background: linear-gradient(180deg, 
        #92dcf9 0%, 
        #71a4e0 10%, 
        #6e92bd 28%, 
        #6d8fbb 55%, 
        #6e95c3 78%, 
        #6eaade 92%, 
        #35bafc 100%
      );

      /* Electric cyan neon border & multi-layered glass shadows */
      border: 2px solid #00f0ff;
      box-shadow: 
        0 0 12px rgba(0, 240, 255, 0.85),
        0 0 24px rgba(0, 215, 255, 0.45),
        inset 0 1.5px 3px rgba(255, 255, 255, 0.95),
        inset 0 0 16px rgba(0, 225, 255, 0.65),
        inset 0 -4px 10px rgba(0, 230, 255, 0.7);
    }

    /* Inner glowing cyan rim contour */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 3.5px;
      border-radius: 20px;
      border: 1px solid rgba(130, 235, 255, 0.65);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.35) 0%, 
        rgba(255, 255, 255, 0.05) 30%, 
        transparent 60%,
        rgba(0, 220, 255, 0.2) 100%
      );
      pointer-events: none;
      z-index: 1;
    }

    /* Top-left organic specular glare hotspot */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 18px;
      width: 75px;
      height: 12px;
      border-radius: 10px;
      background: radial-gradient(ellipse at 30% 50%, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(255, 255, 255, 0.75) 45%, 
        rgba(255, 255, 255, 0.15) 80%, 
        transparent 100%
      );
      filter: blur(0.5px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 55px;
      letter-spacing: -0.015em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.35),
        0 0 14px rgba(56, 189, 248, 0.6);
    }

    .holo-card.double-line span {
      font-size: 44px;
      line-height: 1.05;
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

with open('tune_v6.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v6.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v6.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v6_comp.png')
print('tune_v6_comp.png saved')
