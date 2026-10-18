import subprocess
from PIL import Image

html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@800;900&family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@800&family=Poppins:wght@700;800;900&family=Quicksand:wght@700&family=Rubik:wght@700;800;900&family=Inter:wght@800;900&family=Montserrat:wght@800;900&display=swap" rel="stylesheet">
<style>
body { background: #1a4a8a; color: white; padding: 20px; font-size: 40px; }
.row { margin-bottom: 12px; display: flex; align-items: center; }
.lbl { width: 220px; font-size: 16px; font-family: sans-serif; color: #a0d0ff; }
</style>
</head>
<body>
<div class="row"><div class="lbl">Outfit 800</div><div style="font-family: 'Outfit', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Plus Jakarta Sans 800</div><div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Nunito 800</div><div style="font-family: 'Nunito', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Poppins 800</div><div style="font-family: 'Poppins', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Rubik 800</div><div style="font-family: 'Rubik', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Inter 800</div><div style="font-family: 'Inter', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
<div class="row"><div class="lbl">Montserrat 800</div><div style="font-family: 'Montserrat', sans-serif; font-weight: 800;">Colegio Canadá</div></div>
</body>
</html>"""

with open('font_test.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
subprocess.run([edge, '--headless=new', '--disable-gpu', '--window-size=1000,700', '--screenshot=font_test.png', 'file:///c:/Users/estac/.gemini/antigravity-ide/scratch/creative-web-lab/font_test.html'])
print('font_test.png generated')
