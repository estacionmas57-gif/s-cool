import os, subprocess
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
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
      gap: 10px;
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
      
      /* Vibrant cerulean-cyan jelly gradient matching reference saturation */
      background: linear-gradient(180deg, 
        #4ba8f8 0%, 
        #3494f0 12%, 
        #2983e5 32%, 
        #2073d8 58%, 
        #1d6ed2 75%, 
        #267de0 88%, 
        #2fb2fc 100%
      );

      /* Electric cyan neon border & multi-layered glass shadows */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.8),
        0 0 22px rgba(0, 215, 255, 0.45),
        inset 0 1.5px 3px rgba(255, 255, 255, 0.95),
        inset 0 0 14px rgba(0, 225, 255, 0.6),
        inset 0 -3px 8px rgba(0, 240, 255, 0.75);
    }

    /* Inner glowing cyan wire / bevel */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 21px;
      border: 1.5px solid rgba(80, 230, 255, 0.85);
      box-shadow: 
        0 0 6px rgba(0, 240, 255, 0.6),
        inset 0 0 6px rgba(0, 240, 255, 0.35);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.28) 0%, 
        rgba(255, 255, 255, 0.04) 30%, 
        transparent 65%,
        rgba(0, 220, 255, 0.18) 100%
      );
      pointer-events: none;
      z-index: 1;
    }

    /* Soft curved organic gloss sheen across top-left */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 12px;
      width: 140px;
      height: 35px;
      border-radius: 50%;
      background: radial-gradient(ellipse at 35% 35%, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.6) 28%, 
        rgba(255, 255, 255, 0.15) 55%, 
        transparent 80%
      );
      filter: blur(1.5px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 50px;
      letter-spacing: -0.015em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.4),
        0 0 14px rgba(56, 189, 248, 0.65);
    }

    .holo-card.double-line span {
      font-size: 40px;
      line-height: 1.06;
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

with open('tune_v7.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v7.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v7.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v7_comp.png')
print('tune_v7_comp.png saved')
