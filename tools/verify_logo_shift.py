import subprocess
import time
import json
import urllib.request
import os
import sys
import socket
import base64

sys.path.append(os.path.abspath('scratch'))
from cdp_test import SimpleWS

def main():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"c:\Users\estac\.gemini\antigravity-ide\scratch\creative-web-lab\scratch\edge_profile_logo"
    port = 9230

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
        print(f"Connected to CDP page: {ws_url}")

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

        # 1. Scroll at 0
        eval_js("window.scrollTo(0, 0); if (window.lenisInstance) window.lenisInstance.scrollTo(0, { immediate: true });")
        time.sleep(0.8)

        st0 = eval_js("""
            (() => {
                const logo = document.getElementById('inicio-interactive-logo');
                const rect = logo ? logo.getBoundingClientRect() : {};
                return {
                    scrollY: window.scrollY,
                    logoRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                    logoTransform: logo ? logo.style.transform : '',
                    shiftProgress: window._inicioDebug ? window._inicioDebug.getLogoShiftProgress() : -1
                };
            })()
        """)
        print("State at Scroll = 0%:", json.dumps(st0, indent=2))
        capture_screen("logo_step1_center.png")

        # 2. Scroll at 84% (in the middle of the 1s shift: 0.74 -> 0.94)
        eval_js("""
            (() => {
                const wrapper = document.getElementById('inicio-scroll-wrapper');
                const max = wrapper.offsetHeight - window.innerHeight;
                const pos = max * 0.84;
                window.scrollTo(0, pos);
                if (window.lenisInstance) window.lenisInstance.scrollTo(pos, { immediate: true });
            })()
        """)
        time.sleep(0.8)

        st84 = eval_js("""
            (() => {
                const logo = document.getElementById('inicio-interactive-logo');
                const rect = logo ? logo.getBoundingClientRect() : {};
                return {
                    scrollY: window.scrollY,
                    logoRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                    logoTransform: logo ? logo.style.transform : '',
                    shiftProgress: window._inicioDebug ? window._inicioDebug.getLogoShiftProgress() : -1
                };
            })()
        """)
        print("State at Scroll = 84% (Mid shift):", json.dumps(st84, indent=2))
        capture_screen("logo_step2_mid_shift.png")

        # 3. Scroll at 100% (Interactive Video 2 active, logo settled at top-left)
        eval_js("""
            (() => {
                const wrapper = document.getElementById('inicio-scroll-wrapper');
                const max = wrapper.offsetHeight - window.innerHeight;
                window.scrollTo(0, max);
                if (window.lenisInstance) window.lenisInstance.scrollTo(max, { immediate: true });
            })()
        """)
        time.sleep(0.8)

        st100 = eval_js("""
            (() => {
                const logo = document.getElementById('inicio-interactive-logo');
                const rect = logo ? logo.getBoundingClientRect() : {};
                const layer = document.getElementById('inicio-hotspots-layer');
                return {
                    scrollY: window.scrollY,
                    logoRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                    logoTransform: logo ? logo.style.transform : '',
                    shiftProgress: window._inicioDebug ? window._inicioDebug.getLogoShiftProgress() : -1,
                    layerActive: layer ? layer.classList.contains('is-active') : false
                };
            })()
        """)
        print("State at Scroll = 100% (Settled in top-left):", json.dumps(st100, indent=2))
        capture_screen("logo_step3_top_left_settled.png")

        ws.close()
        print("LOGO TRANSITION VERIFICATION COMPLETE!")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()
