import subprocess, os
from PIL import Image

html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@700;800&family=Montserrat:wght@700;800;900&family=Inter:wght@800;900&display=swap" rel="stylesheet">
<style>
body { background: #1f6cb5; color: #fff; margin: 0; padding: 20px; font-size: 48px; }
.test { margin-bottom: 25px; line-height: 1; }
.w-outfit-800 { font-family: 'Outfit'; font-weight: 800; }
.w-outfit-900 { font-family: 'Outfit'; font-weight: 900; }
.w-jakarta-800 { font-family: 'Plus Jakarta Sans'; font-weight: 800; }
.w-montserrat-800 { font-family: 'Montserrat'; font-weight: 800; }
.w-inter-800 { font-family: 'Inter'; font-weight: 800; }
</style>
</head>
<body>
<div class="test w-outfit-800">Colegio Canadá Emisora Digital</div>
<div class="test w-outfit-900">Colegio Canadá Emisora Digital</div>
<div class="test w-jakarta-800">Colegio Canadá Emisora Digital</div>
<div class="test w-montserrat-800">Colegio Canadá Emisora Digital</div>
<div class="test w-inter-800">Colegio Canadá Emisora Digital</div>
</body>
</html>"""

with open('font_compare2.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
out_path = os.path.abspath('font_compare2.png')
subprocess.run([edge, '--headless=new', '--disable-gpu', '--window-size=1200,600', f'--screenshot={out_path}', 'file:///' + os.path.abspath('font_compare2.html')], capture_output=True)
print('font_compare2.png generated')
