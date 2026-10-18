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
      gap: 8px;
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
      
      /* Pure cerulean-cyan glass gradient matching reference exactly */
      background: linear-gradient(180deg, 
        #52a0f2 0%, 
        #5a96d8 14%, 
        #538acd 35%, 
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
      width: 80px;
      height: 11px;
      border-radius: 8px;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.96) 0%, 
        rgba(255, 255, 255, 0.8) 40%, 
        rgba(255, 255, 255, 0.15) 80%, 
        transparent 100%
      );
      filter: blur(0.8px);
      pointer-events: none;
      z-index: 2;
    }

    /* Subtle top specular rim highlight */
    .holo-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 8%;
      right: 8%;
      height: 2.5px;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 30%, rgba(255, 255, 255, 0.85) 70%, transparent 100%);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-weight: 800;
      font-size: 51px;
      letter-spacing: -0.015em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 25, 75, 0.35),
        0 0 12px rgba(56, 189, 248, 0.6);
    }

    .holo-card.double-line span {
      font-size: 44px;
      line-height: 1.04;
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

with open('tune_v4.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_v4.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,341',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_v4.html')
], capture_output=True)

# Full comp on white
ref_full = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png')
ref_full_white = Image.new('RGB', (1024, 341), (255, 255, 255))
ref_full_white.paste(ref_full, mask=ref_full.split()[3])

ren_full = Image.open(png_file).convert('RGB')
comp = Image.new('RGB', (1024, 341 * 2))
comp.paste(ref_full_white, (0, 0))
comp.paste(ren_full, (0, 341))
comp.save('tune_v4_comp.png')
print('tune_v4_comp.png saved')

# Calculate MAE for each card
ren_arr = np.array(ren_full)
ref_arr = np.array(ref_full_white)

for name, x_start in [('Colegio', 23), ('Canadá', 355), ('Emisora Digital', 681)]:
    crop_ref = ref_arr[77:254, x_start:x_start+319]
    crop_ren = ren_arr[82:259, x_start:x_start+319]
    mae = np.mean(np.abs(crop_ref.astype(float) - crop_ren.astype(float)))
    print(f'{name} MAE: {mae:.2f}')
