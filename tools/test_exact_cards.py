import os, subprocess
from PIL import Image
import numpy as np

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Outfit:wght@800;900&display=swap" rel="stylesheet">
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
      gap: 7px;
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
      
      /* Exact cerulean-cyan jelly gradient */
      background: linear-gradient(180deg, 
        #50a3f4 0%, 
        #5b93d7 16%, 
        #5288cc 40%, 
        #4f86cb 65%, 
        #5695d7 86%, 
        #5abefb 100%
      );

      /* Electric cyan glowing neon border */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.8),
        0 0 22px rgba(0, 215, 255, 0.45),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.85),
        inset 0 0 14px rgba(0, 230, 255, 0.55),
        inset 0 -3px 8px rgba(0, 240, 255, 0.65);
    }

    /* Top-left glossy specular pill highlight */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 14px;
      left: 20px;
      width: 85px;
      height: 12px;
      border-radius: 10px;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.96) 0%, 
        rgba(255, 255, 255, 0.85) 40%, 
        rgba(255, 255, 255, 0.2) 80%, 
        transparent 100%
      );
      filter: blur(1px);
      pointer-events: none;
      z-index: 2;
    }

    /* Inner glass dome curve */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 21px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.30) 0%, 
        rgba(255, 255, 255, 0.06) 42%, 
        transparent 65%
      );
      pointer-events: none;
      z-index: 1;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-weight: 800;
      font-size: 51px;
      letter-spacing: -0.015em;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.32),
        0 0 14px rgba(56, 189, 248, 0.6);
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

with open('tune_v2.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v2.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v2.html')
], capture_output=True)

ref = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png').convert('RGB')
ren = Image.open(png_file).convert('RGB')

comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref, (0, 0))
comp.paste(ren, (0, 341))
comp.save('tune_v2_comp.png')

crop_ref = np.array(ref)[70:260, 20:1005].astype(float)
crop_ren = np.array(ren)[70:260, 20:1005].astype(float)
mae = np.mean(np.abs(crop_ref - crop_ren))
print(f'tune_v2 MAE: {mae:.2f}')
