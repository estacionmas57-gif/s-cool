import os, subprocess
from PIL import Image
import numpy as np

# We'll use frame_0120.webp as the background
html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: url('assets/frames_inicio/frame_0120.webp') no-repeat center center;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .holo-card {
      position: absolute;
      border-radius: 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Translucent glassmorphic body */
      background: 
        radial-gradient(ellipse 90% 80% at 50% 50%, rgba(140, 210, 255, 0.24) 0%, transparent 75%),
        linear-gradient(180deg, 
          rgba(100, 180, 248, 0.46) 0%, 
          rgba(60, 150, 230, 0.38) 20%, 
          rgba(35, 115, 205, 0.36) 55%, 
          rgba(25, 95, 185, 0.44) 80%, 
          rgba(0, 215, 255, 0.52) 100%
        );

      /* Optical glass refraction blur & color boost */
      backdrop-filter: blur(14px) saturate(160%) brightness(1.06);
      -webkit-backdrop-filter: blur(14px) saturate(160%) brightness(1.06);

      /* Electric cyan glowing neon outer border */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 12px rgba(0, 240, 255, 0.85),
        0 0 26px rgba(0, 215, 255, 0.45),
        inset 0 0 0 3px rgba(10, 60, 140, 0.55); /* Deep channel */
    }

    /* Inner glowing cyan rim with top specular line */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 3.5px;
      border-radius: 22px;
      border: 1.5px solid rgba(40, 226, 255, 0.85);
      border-top-color: rgba(255, 255, 255, 0.95);
      box-shadow: 
        0 0 6px rgba(0, 240, 255, 0.65),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
        inset 0 0 12px rgba(0, 220, 255, 0.5),
        inset 0 -3px 8px rgba(0, 240, 255, 0.7);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.24) 0%, 
        rgba(255, 255, 255, 0.04) 25%, 
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
      top: 9px;
      left: 18px;
      width: 72px;
      height: 9px;
      border-radius: 8px;
      background: radial-gradient(ellipse at 35% 40%, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(255, 255, 255, 0.7) 40%, 
        rgba(255, 255, 255, 0.15) 75%, 
        transparent 100%
      );
      filter: blur(0.8px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 55px;
      letter-spacing: -0.01em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 15, 45, 0.45),
        0 0 16px rgba(56, 189, 248, 0.8);
    }

    .holo-card.double-line span {
      font-size: 44px;
      line-height: 1.05;
      letter-spacing: -0.01em;
    }

    /* Specific coordinates from css/inicio.css in 1280x720 stage */
    .hotspot-colegios {
      left: 6.25%; top: 31.25%;
      width: 22.5%; height: 24.5%;
    }
    .hotspot-canada {
      left: 46.88%; top: 32.5%;
      width: 21.0%; height: 23.5%;
    }
    .hotspot-emisora {
      left: 70.0%; top: 30.5%;
      width: 22.5%; height: 25.5%;
    }
  </style>
</head>
<body>
  <div class="holo-card hotspot-colegios">
    <span>Colegio</span>
  </div>
  <div class="holo-card hotspot-canada">
    <span>Canadá</span>
  </div>
  <div class="holo-card double-line hotspot-emisora">
    <span>Emisora<br>Digital</span>
  </div>
</body>
</html>
"""

with open('test_translucent.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('test_translucent.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,720',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('test_translucent.html')
], capture_output=True)

# Crop Canada card from test_translucent.png:
# Canada is at left 46.88% (600px), top 32.5% (234px), width 21% (269px), height 23.5% (169px)
ren_full = Image.open(png_file)
crop_canada_ren = ren_full.crop((580, 215, 890, 425))
crop_canada_ren.save('canada_translucent_crop.png')

# User's uploaded reference:
ref_user = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792281756807.png')

# Side by side comparison:
comp = Image.new('RGB', (max(ref_user.width, crop_canada_ren.width), ref_user.height + crop_canada_ren.height + 10))
comp.paste(ref_user.convert('RGB'), (0, 0))
comp.paste(crop_canada_ren.resize((ref_user.width, int(crop_canada_ren.height * ref_user.width / crop_canada_ren.width))), (0, ref_user.height + 10))
comp.save('translucent_comparison.png')
print('translucent_comparison.png saved')
