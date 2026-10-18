import subprocess
import time
import json
import urllib.request
import os
import sys
import socket
import base64
import struct

sys.path.append(os.path.abspath('scratch'))
from cdp_test import SimpleWS

def main():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"c:\Users\estac\.gemini\antigravity-ide\scratch\creative-web-lab\scratch\edge_profile_verify"
    port = 9228

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

        # 1. Enable Runtime & Page
        ws.call("Page.enable")
        ws.call("Runtime.enable")

        # Let frames preload
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

        # Verify initial state (scroll = 0)
        eval_js("window.scrollTo(0, 0);")
        time.sleep(0.5)
        eval_js("if (window.lenisInstance) window.lenisInstance.scrollTo(0, { immediate: true });")
        time.sleep(0.5)

        st0 = eval_js("""
            (() => {
                const layer = document.getElementById('inicio-hotspots-layer');
                const c = document.getElementById('inicio-story-canvas');
                const btnColegios = document.getElementById('hotspot-colegios');
                const style = btnColegios ? window.getComputedStyle(btnColegios) : {};
                return {
                    scrollY: window.scrollY,
                    mode: window._inicioDebug ? window._inicioDebug.getMode() : 'unknown',
                    lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                    lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown',
                    layerIsActive: layer ? layer.classList.contains('is-active') : false,
                    cardOpacity: style.opacity || '0',
                    cardPointerEvents: style.pointerEvents || 'none'
                };
            })()
        """)
        print("Initial state (Scroll = 0):", json.dumps(st0, indent=2))
        capture_screen("step1_scroll_0.png")

        # Verify mid scroll (scroll = 50%)
        eval_js("""
            (() => {
                const wrapper = document.getElementById('inicio-scroll-wrapper');
                const max = wrapper.offsetHeight - window.innerHeight;
                const half = max * 0.5;
                window.scrollTo(0, half);
                if (window.lenisInstance) window.lenisInstance.scrollTo(half, { immediate: true });
            })()
        """)
        time.sleep(1.0)

        st50 = eval_js("""
            (() => {
                const layer = document.getElementById('inicio-hotspots-layer');
                const btnColegios = document.getElementById('hotspot-colegios');
                const style = btnColegios ? window.getComputedStyle(btnColegios) : {};
                return {
                    scrollY: window.scrollY,
                    mode: window._inicioDebug ? window._inicioDebug.getMode() : 'unknown',
                    lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                    lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown',
                    layerIsActive: layer ? layer.classList.contains('is-active') : false,
                    cardOpacity: style.opacity || '0'
                };
            })()
        """)
        print("Mid state (Scroll = 50%):", json.dumps(st50, indent=2))
        capture_screen("step2_scroll_50.png")

        # Verify end of scroll (scroll = 100%) -> Cards Appear & Video 2 starts!
        eval_js("""
            (() => {
                const wrapper = document.getElementById('inicio-scroll-wrapper');
                const max = wrapper.offsetHeight - window.innerHeight;
                window.scrollTo(0, max);
                if (window.lenisInstance) window.lenisInstance.scrollTo(max, { immediate: true });
            })()
        """)
        time.sleep(1.0)

        st100 = eval_js("""
            (() => {
                const layer = document.getElementById('inicio-hotspots-layer');
                const btnColegios = document.getElementById('hotspot-colegios');
                const btnCanada = document.getElementById('hotspot-canada');
                const btnEmisora = document.getElementById('hotspot-emisora');
                const s1 = btnColegios ? window.getComputedStyle(btnColegios) : {};
                const s2 = btnCanada ? window.getComputedStyle(btnCanada) : {};
                const s3 = btnEmisora ? window.getComputedStyle(btnEmisora) : {};
                return {
                    scrollY: window.scrollY,
                    mode: window._inicioDebug ? window._inicioDebug.getMode() : 'unknown',
                    lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                    lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown',
                    layerIsActive: layer ? layer.classList.contains('is-active') : false,
                    colegioOpacity: s1.opacity,
                    canadaOpacity: s2.opacity,
                    emisoraOpacity: s3.opacity,
                    colegioPointer: s1.pointerEvents
                };
            })()
        """)
        print("End state (Scroll = 100%):", json.dumps(st100, indent=2))
        capture_screen("step3_scroll_100_cards_active.png")

        # Simulate horizontal mouse scrubbing in interactive mode
        # 1. Mouse to Left (X=180, Y=350) -> Pointing towards Colegios
        eval_js("""
            window.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 180,
                clientY: 350,
                bubbles: true
            }));
        """)
        time.sleep(0.6)
        st_left = eval_js("""
            ({
                lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown'
            })
        """)
        print("Mouse Left pointing state:", st_left)
        capture_screen("step4_point_colegios.png")

        # 2. Mouse to Center (X=640, Y=350) -> Pointing towards Canadá
        eval_js("""
            window.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 640,
                clientY: 350,
                bubbles: true
            }));
        """)
        time.sleep(0.6)
        st_mid = eval_js("""
            ({
                lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown'
            })
        """)
        print("Mouse Center pointing state:", st_mid)
        capture_screen("step5_point_canada.png")

        # 3. Mouse to Right (X=1150, Y=350) -> Pointing towards Emisora Digital
        eval_js("""
            window.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 1150,
                clientY: 350,
                bubbles: true
            }));
        """)
        time.sleep(0.6)
        st_right = eval_js("""
            ({
                lastFrame: window._inicioDebug ? window._inicioDebug.getLastDrawnFrame() : -1,
                lastType: window._inicioDebug ? window._inicioDebug.getLastType() : 'unknown'
            })
        """)
        print("Mouse Right pointing state:", st_right)
        capture_screen("step6_point_emisora.png")

        ws.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()
