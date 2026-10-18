import subprocess, os
from PIL import Image

html = """<!DOCTYPE html>
<html>
<head>
<style>
body { background: #3b5f88; margin: 0; padding: 20px; }
.test {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 700;
  font-size: 58px;
  color: #ffffff;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.25);
}
</style>
</head>
<body>
<div class="test">Canadá</div>
</body>
</html>"""

with open('test_arial.html', 'w', encoding='utf-8') as f:
    f.write(html)

edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
subprocess.run([edge, '--headless=new', '--disable-gpu', '--window-size=400,150', '--screenshot=' + os.path.abspath('arial_crop.png'), 'file:///' + os.path.abspath('test_arial.html')], capture_output=True)

ref = Image.open('canada_zoom.png')
ren = Image.open('arial_crop.png')

comp = Image.new('RGB', (max(ref.width, ren.width), ref.height + ren.height + 10))
comp.paste(ref, (0, 0))
comp.paste(ren, (0, ref.height + 10))
comp.save('arial_match_comp.png')
print('arial_match_comp.png saved')
