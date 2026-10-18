import os, subprocess
from PIL import Image
import numpy as np

def render_and_compare(html_content, output_name='tune_cards'):
    html_file = os.path.abspath(f'{output_name}.html')
    png_file = os.path.abspath(f'{output_name}.png')
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    subprocess.run([
        edge,
        '--headless=new',
        '--disable-gpu',
        '--window-size=1024,341',
        f'--screenshot={png_file}',
        f'file:///{html_file}'
    ], capture_output=True)
    
    ref = Image.open(r'C:\Users\estac\.gemini\antigravity-ide\brain\b2b9e79c-333e-45db-982b-0cec8017693f\.user_uploaded\media_1792278894395.png').convert('RGB')
    ren = Image.open(png_file).convert('RGB')
    
    ref_arr = np.array(ref).astype(float)
    ren_arr = np.array(ren).astype(float)
    
    # Calculate Mean Absolute Error across the 3 card areas
    # Card areas roughly: Y: 70..260, X: 20..1005
    crop_ref = ref_arr[70:260, 20:1005]
    crop_ren = ren_arr[70:260, 20:1005]
    mae = np.mean(np.abs(crop_ref - crop_ren))
    
    # Generate side-by-side comparison
    comp = Image.new('RGB', (1024, 341 * 2))
    comp.paste(ref, (0, 0))
    comp.paste(ren, (0, 341))
    comp_file = f'{output_name}_comp.png'
    comp.save(comp_file)
    
    print(f'MAE: {mae:.2f} | Saved: {comp_file}')
    return mae

css_template = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@800&family=Poppins:wght@800&display=swap" rel="stylesheet">
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
      gap: 7.5px;
      padding-left: 23px;
      padding-right: 23px;
    }

    .holo-card {
      position: relative;
      width: 320px;
      height: 177px;
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      
      /* Vibrant cyan-blue jelly gradient */
      background: linear-gradient(180deg, 
        #6da3e5 0%, 
        #5291dc 18%, 
        #3e83d4 45%, 
        #347acc 75%, 
        #498fe0 92%,
        #5aa2ee 100%
      );

      /* Electric cyan glowing border & inner bevels */
      border: 2px solid #00efff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.7),
        0 0 20px rgba(0, 215, 255, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.9),
        inset 0 0 10px rgba(0, 220, 255, 0.5),
        inset 0 -2px 6px rgba(0, 240, 255, 0.6);
    }

    /* Top-left glossy specular pill highlight */
    .holo-card::before {
      content: '';
      position: absolute;
      top: 14px;
      left: 22px;
      width: 110px;
      height: 14px;
      border-radius: 10px;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.8) 35%, 
        rgba(255, 255, 255, 0.25) 75%, 
        transparent 100%
      );
      filter: blur(1.2px);
      pointer-events: none;
      z-index: 2;
    }

    /* Inner glass dome curve */
    .holo-card::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 19px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.32) 0%, 
        rgba(255, 255, 255, 0.08) 40%, 
        transparent 60%
      );
      pointer-events: none;
      z-index: 1;
    }

    .holo-card span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 50px;
      letter-spacing: -0.015em;
      text-shadow: 
        0 2px 4px rgba(0, 30, 80, 0.35),
        0 0 12px rgba(56, 189, 248, 0.55);
    }

    .holo-card.double-line span {
      font-size: 40px;
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

render_and_compare(css_template, 'tune_v1')
