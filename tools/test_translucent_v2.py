import os, subprocess
from PIL import Image
import numpy as np

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
      
      /* Pure translucent glassmorphism (vidrio traslúcido) */
      background: linear-gradient(180deg, 
        rgba(150, 215, 255, 0.20) 0%, 
        rgba(90, 175, 245, 0.10) 35%, 
        rgba(50, 140, 235, 0.12) 70%, 
        rgba(0, 225, 255, 0.22) 100%
      );

      /* Optical background blur & translucency */
      backdrop-filter: blur(8px) saturate(125%) brightness(1.03);
      -webkit-backdrop-filter: blur(8px) saturate(125%) brightness(1.03);

      /* Electric cyan glowing neon outer border */
      border: 2px solid #38d8ff;
      box-shadow: 
        0 0 12px rgba(0, 240, 255, 0.75),
        0 0 25px rgba(0, 220, 255, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.85),
        inset 0 0 12px rgba(0, 230, 255, 0.25),
        inset 0 -2px 6px rgba(0, 240, 255, 0.4);
    }

    /* Inner subtle glass contour */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 3.5px;
      border-radius: 22px;
      border: 1px solid rgba(130, 235, 255, 0.45);
      border-top-color: rgba(255, 255, 255, 0.85);
      pointer-events: none;
      z-index: 1;
    }

    /* Top-left organic gloss specular glare */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 16px;
      width: 75px;
      height: 10px;
      border-radius: 8px;
      background: radial-gradient(ellipse at 35% 40%, 
        rgba(255, 255, 255, 0.85) 0%, 
        rgba(255, 255, 255, 0.45) 45%, 
        transparent 80%
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

    /* Positions */
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

with open('test_translucent_v2.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('test_translucent_v2.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,720',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('test_translucent_v2.html')
], capture_output=True)

ren_full = Image.open(png_file)
crop_canada_ren = ren_full.crop((580, 215, 890, 425))
crop_canada_ren.save('canada_translucent_v2_crop.png')

# User's uploaded reference:
ref_user = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792281756807.png')

# Side by side comparison:
comp = Image.new('RGB', (ref_user.width, ref_user.height + ref_user.height + 10))
comp.paste(ref_user.convert('RGB'), (0, 0))
comp.paste(crop_canada_ren.resize((ref_user.width, ref_user.height)), (0, ref_user.height + 10))
comp.save('translucent_v2_comparison.png')
print('translucent_v2_comparison.png saved')
