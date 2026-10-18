import os, subprocess
from PIL import Image

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
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
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Pure translucent frosted crystal glass */
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.16) 0%, 
        rgba(180, 230, 255, 0.06) 40%, 
        rgba(100, 200, 255, 0.05) 70%, 
        rgba(0, 225, 255, 0.12) 100%
      );

      /* Optical glassmorphism blur */
      backdrop-filter: blur(4px) saturate(115%) brightness(1.02);
      -webkit-backdrop-filter: blur(4px) saturate(115%) brightness(1.02);

      /* Electric cyan glowing neon outer border */
      border: 2px solid #5de4ff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.7),
        0 0 20px rgba(0, 240, 255, 0.35),
        inset 0 1px 2px rgba(255, 255, 255, 0.8),
        inset 0 0 10px rgba(0, 230, 255, 0.15);
    }

    /* Inner subtle glass contour */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 21px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-top-color: rgba(255, 255, 255, 0.85);
      pointer-events: none;
      z-index: 1;
    }

    /* Top glowing specular highlight */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 12%;
      right: 12%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #ffffff 30%, #5de4ff 70%, transparent 100%);
      filter: blur(0.5px);
      pointer-events: none;
      z-index: 2;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      font-weight: 700;
      font-size: 52px;
      letter-spacing: -0.01em;
      line-height: 1;
      text-shadow: 
        0 2px 4px rgba(0, 15, 45, 0.35),
        0 0 12px rgba(90, 220, 255, 0.5);
    }

    .holo-card.double-line span {
      font-size: 42px;
      line-height: 1.05;
      letter-spacing: -0.01em;
    }

    /* Canada card in 1280x720 coordinates */
    .hotspot-canada {
      left: 46.88%; top: 32.5%;
      width: 21.0%; height: 23.5%;
    }
  </style>
</head>
<body>
  <div class="holo-card hotspot-canada">
    <span>Canadá</span>
  </div>
</body>
</html>
"""

with open('test_exact_translucent.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('test_exact_translucent.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,720',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('test_exact_translucent.html')
], capture_output=True)

ren_full = Image.open(png_file)
crop_canada_ren = ren_full.crop((580, 215, 890, 425))

# User's uploaded reference:
ref_user = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792281756807.png')

comp = Image.new('RGB', (ref_user.width, ref_user.height + ref_user.height + 10))
comp.paste(ref_user.convert('RGB'), (0, 0))
comp.paste(crop_canada_ren.resize((ref_user.width, ref_user.height)), (0, ref_user.height + 10))
comp.save('exact_translucent_comp.png')
print('exact_translucent_comp.png saved')
