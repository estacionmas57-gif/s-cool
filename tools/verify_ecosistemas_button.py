import subprocess
import time
import json
import urllib.request
import os
import sys
import base64

sys.path.append(os.path.abspath('scratch'))
from cdp_test import SimpleWS

def main():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"c:\Users\estac\.gemini\antigravity-ide\scratch\creative-web-lab\scratch\edge_profile_btn"
    port = 9232

    print("Launching Edge headless...")
    proc = subprocess.Popen([
        edge_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,720",
        "http://localhost:8080/"
    ])

    time.sleep(2.5)

    try:
        targets_raw = urllib.request.urlopen(f"http://localhost:{port}/json").read()
        targets = json.loads(targets_raw.decode('utf-8'))
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]

        ws = SimpleWS(ws_url)
        ws.call("Page.enable")
        ws.call("Runtime.enable")

        time.sleep(1.5)

        def eval_js(expr):
            res = ws.call("Runtime.evaluate", {"expression": expr, "returnByValue": True})
            return res.get("result", {}).get("value")

        def capture_screen(filename):
            res = ws.call("Page.captureScreenshot", {"format": "png"})
            data = base64.b64decode(res["data"])
            filepath = os.path.join("scratch", filename)
            with open(filepath, "wb") as f:
                f.write(data)
            print(f"Saved screenshot: {filepath} ({len(data)} bytes)")

        # Scroll to 100% to inspect full view with cards and top header
        eval_js("""
            (() => {
                const wrapper = document.getElementById('inicio-scroll-wrapper');
                const max = wrapper.offsetHeight - window.innerHeight;
                window.scrollTo(0, max);
                if (window.lenisInstance) window.lenisInstance.scrollTo(max, { immediate: true });
            })()
        """)
        time.sleep(1.0)

        # Inspect Ecosistemas button state and check that test logo button is gone
        info = eval_js("""
            (() => {
                const btn = document.getElementById('world-tab-toggle');
                const testBtn = document.getElementById('btn-toggle-logo-test');
                const spark = document.querySelector('.tab-toggle-spark');
                const rect = btn ? btn.getBoundingClientRect() : {};
                const cs = btn ? window.getComputedStyle(btn) : {};
                return {
                    buttonExists: !!btn,
                    buttonText: btn ? btn.innerText.trim() : '',
                    sparkExists: !!spark,
                    testBtnExists: !!testBtn,
                    background: cs.backgroundImage || cs.backgroundColor,
                    borderRadius: cs.borderRadius,
                    backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
                    rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
                };
            })()
        """)
        print("Button Verification Info:", json.dumps(info, indent=2))

        capture_screen("verify_ecosistemas_glass_view.png")

        # Test clicking Ecosistemas to see the glass dropdown
        eval_js("document.getElementById('world-tab-toggle').click();")
        time.sleep(0.5)
        capture_screen("verify_ecosistemas_menu_opened.png")

        ws.close()
        print("VERIFICATION COMPLETED!")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()
