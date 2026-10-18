import os, subprocess
from PIL import Image

html = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: url('assets/frames_inicio/frame_0120.webp') no-repeat center center;
      background-size: cover;
      position: relative;
    }

    .cards-stage {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      perspective: 1200px;
      perspective-origin: 50% 42%;
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
      
      /* Pure translucent crystal frosted glass */
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.16) 0%, 
        rgba(180, 230, 255, 0.06) 40%, 
        rgba(100, 200, 255, 0.05) 70%, 
        rgba(0, 225, 255, 0.12) 100%
      );

      backdrop-filter: blur(5px) saturate(115%) brightness(1.02);
      -webkit-backdrop-filter: blur(5px) saturate(115%) brightness(1.02);

      border: 2px solid #5de4ff;
      box-shadow: 
        0 0 10px rgba(0, 240, 255, 0.7),
        0 0 20px rgba(0, 240, 255, 0.35),
        inset 0 1px 2px rgba(255, 255, 255, 0.8),
        inset 0 0 10px rgba(0, 230, 255, 0.15);
      
      transform-style: preserve-3d;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
    }

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

    /* ── Posiciones 3D exactas calibradas ── */
    
    /* 1. Colegio: Angulada hacia la derecha (metida hacia la pantalla en el eje central) */
    .hotspot-colegios {
      left: 6.2%; top: 31.0%;
      width: 21.8%; height: 24.8%;
      transform: rotateY(18deg) rotateX(0.5deg);
      transform-origin: center right;
    }

    /* 2. Canadá: Frontal absoluta */
    .hotspot-canada {
      left: 47.0%; top: 32.5%;
      width: 21.0%; height: 23.5%;
      transform: rotateY(0deg);
      transform-origin: center center;
    }

    /* 3. Emisora Digital: Angulada hacia la izquierda (metida hacia la pantalla en el eje central) */
    .hotspot-emisora {
      left: 69.2%; top: 30.5%;
      width: 22.8%; height: 25.5%;
      transform: rotateY(-18deg) rotateX(0.5deg);
      transform-origin: center left;
    }

    /* Hover 3D que reacciona respetando su ángulo base */
    .hotspot-colegios:hover {
      transform: rotateY(12deg) translateY(-4px) scale(1.02);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.9), 0 0 32px rgba(0, 220, 255, 0.55);
    }
    .hotspot-canada:hover {
      transform: rotateY(0deg) translateY(-4px) scale(1.02);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.9), 0 0 32px rgba(0, 220, 255, 0.55);
    }
    .hotspot-emisora:hover {
      transform: rotateY(-12deg) translateY(-4px) scale(1.02);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.9), 0 0 32px rgba(0, 220, 255, 0.55);
    }
  </style>
</head>
<body>
  <div class="cards-stage">
    <div class="holo-card hotspot-colegios">
      <span>Colegio</span>
    </div>
    <div class="holo-card hotspot-canada">
      <span>Canadá</span>
    </div>
    <div class="holo-card double-line hotspot-emisora">
      <span>Emisora<br>Digital</span>
    </div>
  </div>
</body>
</html>
"""

with open('tune_perspective_calibrated.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
png_file = os.path.abspath('tune_perspective_calibrated.png')
subprocess.run([
    edge,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,720',
    f'--screenshot={png_file}',
    'file:///' + os.path.abspath('tune_perspective_calibrated.html')
], capture_output=True)

print('tune_perspective_calibrated.png saved')
