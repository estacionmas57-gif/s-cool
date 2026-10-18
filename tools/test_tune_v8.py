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
    }

    .holo-card {
      position: relative;
      width: 320px;
      height: 177px;
      border-radius: 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Vibrant translucent oceanic cyan-blue */
      background: linear-gradient(180deg, 
        #4ba0f2 0%, 
        #3b91ec 14%, 
        #2f80e0 36%, 
        #2574d6 60%, 
        #2270d2 78%, 
        #2a80e2 90%, 
        #2eb7fc 100%
      );

      /* Crisp electric cyan outer border */
      border: 2px solid #00f0ff;
      box-shadow: 
        0 0 8px rgba(0, 240, 255, 0.8),
        0 0 20px rgba(0, 215, 255, 0.4),
        inset 0 0 0 3px #1664bf; /* Darker channel between outer and inner border */
    }

    /* Inner glowing cyan rim */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 4.5px;
      border-radius: 21px;
      border: 1.5px solid #2ae0ff;
      box-shadow: 
        inset 0 1px 2px rgba(255, 255, 255, 0.8),
        inset 0 0 12px rgba(0, 220, 255, 0.5),
        inset 0 -3px 8px rgba(0, 240, 255, 0.7);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.25) 0%, 
        rgba(255, 255, 255, 0.04) 25%, 
        transparent 60%,
        rgba(0, 220, 255, 0.15) 100%
      );
      pointer-events: none;
      z-index: 1;
    }

    /* Subtle organic top-left gloss specular glare */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 18px;
      width: 75px;
      height: 14px;
      border-radius: 12px;
      background: radial-gradient(ellipse at 30% 40%, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.6) 35%, 
        rgba(255, 255, 255, 0.1) 70%, 
        transparent 100%
      );
      filter: blur(1px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 51px;
      letter-spacing: -0.01em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.35),
        0 0 14px rgba(56, 189, 248, 0.7);
    }

    .holo-card.double-line span {
      font-size: 42px;
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

with open('tune_v8.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v8.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v8.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v8_comp.png')
print('tune_v8_comp.png saved')
